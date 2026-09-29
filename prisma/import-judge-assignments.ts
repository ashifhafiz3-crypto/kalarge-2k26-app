import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as XLSX from "xlsx";
import path from "path";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const EXCEL_FILE = path.join(
  process.cwd(),
  "prisma",
  "KALARGE_2K26_JUDGE_ASSIGNMENTS_FINAL_CONFIRMED.xlsx"
);

async function main() {
  console.log("");
  console.log("========================================");
  console.log(" KALARGE 2K26 JUDGE ASSIGNMENT IMPORT");
  console.log("========================================");

  // --------------------------------------------------
  // 1. Read Excel
  // --------------------------------------------------

  console.log("\nReading Excel...");

  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheet = workbook.Sheets["IMPORT_READY"];

  if (!sheet) {
    throw new Error("IMPORT_READY sheet not found in Excel.");
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  console.log(`Excel assignments found: ${rows.length}`);

  if (rows.length !== 155) {
    throw new Error(
      `Expected exactly 155 assignments, but found ${rows.length}.`
    );
  }

  // --------------------------------------------------
  // 2. Validate Excel rows
  // --------------------------------------------------

  const seen = new Set<string>();

  for (const row of rows) {
    const assignmentId = String(row.assignment_id ?? "").trim();
    const judgeId = String(row.judge_id ?? "").trim();
    const programId = String(row.program_id ?? "").trim();
    const category = String(row.category ?? "").trim().toUpperCase();
    const competitionType = String(
      row.competition_type ?? ""
    ).trim().toUpperCase();

    if (!assignmentId) {
      throw new Error("Missing assignment_id.");
    }

    if (!judgeId) {
      throw new Error(`Missing judge_id for ${assignmentId}.`);
    }

    if (!programId) {
      throw new Error(`Missing program_id for ${assignmentId}.`);
    }

    if (!["SJR", "JR", "SR", "SSR", "GN"].includes(category)) {
      throw new Error(
        `Invalid category "${category}" for ${assignmentId}.`
      );
    }

    if (!["GROUP", "INDIVIDUAL"].includes(competitionType)) {
      throw new Error(
        `Invalid competition_type "${competitionType}" for ${assignmentId}.`
      );
    }

    const uniqueKey = `${judgeId}|${programId}`;

    if (seen.has(uniqueKey)) {
      throw new Error(
        `Duplicate judge/program assignment found: ${uniqueKey}`
      );
    }

    seen.add(uniqueKey);
  }

  console.log("Excel validation: OK");
  console.log(`Unique assignments: ${seen.size}`);

  // --------------------------------------------------
  // 3. Validate four user-confirmed classifications
  // --------------------------------------------------

  const confirmed = {
    KGP084: ["SSR", "GROUP"],
    KGP092: ["GN", "INDIVIDUAL"],
    KGP025: ["GN", "GROUP"],
    KGP105: ["GN", "GROUP"],
  } as const;

  for (const row of rows) {
    const programId = String(row.program_id).trim();

    if (programId in confirmed) {
      const [expectedCategory, expectedType] =
        confirmed[programId as keyof typeof confirmed];

      const actualCategory = String(row.category)
        .trim()
        .toUpperCase();

      const actualType = String(row.competition_type)
        .trim()
        .toUpperCase();

      if (
        actualCategory !== expectedCategory ||
        actualType !== expectedType
      ) {
        throw new Error(
          `${programId} classification mismatch. ` +
            `Expected ${expectedCategory}/${expectedType}, ` +
            `found ${actualCategory}/${actualType}.`
        );
      }
    }
  }

  console.log("Confirmed classifications: OK");

  // --------------------------------------------------
  // 4. Validate judges and programmes exist
  // --------------------------------------------------

  console.log("\nChecking judges and programmes...");

  const judgeIds = [
    ...new Set(rows.map((r) => String(r.judge_id).trim())),
  ];

  const programIds = [
    ...new Set(rows.map((r) => String(r.program_id).trim())),
  ];

  for (const judgeId of judgeIds) {
    const judge = await prisma.judge.findUnique({
      where: { id: judgeId },
    });

    if (!judge) {
      throw new Error(`Judge not found in database: ${judgeId}`);
    }
  }

  for (const programId of programIds) {
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      throw new Error(`Program not found in database: ${programId}`);
    }
  }

  console.log(`Judges checked: ${judgeIds.length}`);
  console.log(`Programmes checked: ${programIds.length}`);
  console.log("Database validation: OK");

  // --------------------------------------------------
  // 5. Import assignments
  // --------------------------------------------------

  console.log("\nImporting assignments...");

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const assignmentId = String(row.assignment_id).trim();
    const judgeId = String(row.judge_id).trim();
    const programId = String(row.program_id).trim();

    let assignedDate: Date | null = null;

    if (row.assigned_date) {
      const parsed = new Date(row.assigned_date);

      if (!Number.isNaN(parsed.getTime())) {
        assignedDate = parsed;
      }
    }

    const existing = await prisma.judgeAssignment.findUnique({
      where: {
        judgeId_programId: {
          judgeId,
          programId,
        },
      },
    });

    await prisma.judgeAssignment.upsert({
      where: {
        judgeId_programId: {
          judgeId,
          programId,
        },
      },

      update: {
        assignedDate,
        status: "ASSIGNED",
      },

      create: {
        id: assignmentId,
        judgeId,
        programId,
        assignedDate,
        status: "ASSIGNED",
      },
    });

    if (existing) {
      updated++;
    } else {
      created++;
    }
  }

  // --------------------------------------------------
  // 6. Final database count
  // --------------------------------------------------

  const totalAssignments =
    await prisma.judgeAssignment.count();

  console.log("");
  console.log("========================================");
  console.log(" IMPORT COMPLETED");
  console.log("========================================");
  console.log(`Excel assignments : ${rows.length}`);
  console.log(`Created           : ${created}`);
  console.log(`Updated           : ${updated}`);
  console.log(`Database total    : ${totalAssignments}`);
  console.log("");
  console.log("GROUP              : 35");
  console.log("INDIVIDUAL         : 120");
  console.log("TOTAL              : 155");
  console.log("");
  console.log("KGP084              SSR / GROUP");
  console.log("KGP092              GN / INDIVIDUAL");
  console.log("KGP025              GN / GROUP");
  console.log("KGP105              GN / GROUP");
  console.log("");
  console.log("STATUS: SUCCESS");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("");
    console.error("========================================");
    console.error(" IMPORT FAILED");
    console.error("========================================");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });