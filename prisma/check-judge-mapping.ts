import "dotenv/config";
import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const FILE = "programmes for judges(4).xlsx";

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\{[^}]*\}/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[.…\-–—]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[.:;,!?'"“”‘’()]/g, "")
    .toLowerCase()
    .trim();
}

function categoryCode(value: unknown): string | null {
  const text = String(value ?? "").toUpperCase().trim();
  const match = text.match(/\((SJ|SJR|JR|SR|SSR|GN)\)/);

  if (!match) return null;

  return match[1] === "SJ" ? "SJR" : match[1];
}

async function main() {
  const workbook = XLSX.readFile(FILE);

  const programs = await prisma.program.findMany({
    include: {
      category: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  const unmatched = new Map<string, Set<string>>();
  const ambiguous = new Map<string, Set<string>>();

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    }) as unknown[][];

    let judgeId = "";

    for (const row of rows) {
      for (const cell of row) {
        const value = String(cell ?? "").trim();

        if (/^KGJ\d{3}$/i.test(value)) {
          judgeId = value.toUpperCase();
          break;
        }
      }

      if (judgeId) break;
    }

    if (!judgeId) continue;

    const found = new Set<string>();

    for (const row of rows) {
      for (let i = 0; i < row.length; i++) {
        const category = categoryCode(row[i]);

        if (!category) continue;

        let programmeName = "";

        for (let j = i - 1; j >= 0; j--) {
          const candidate = String(row[j] ?? "").trim();

          if (!candidate) continue;

          if (
            /^\d{1,2}[:.]\d{2}/.test(candidate) ||
            /^\d{2}\/\d{2}\/\d{4}/.test(candidate) ||
            /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/i.test(
              candidate
            )
          ) {
            continue;
          }

          programmeName = candidate;
          break;
        }

        if (!programmeName) continue;

        const key = `${normalize(programmeName)}|${category}`;

        if (found.has(key)) continue;
        found.add(key);

        const matches = programs.filter(
          (program) =>
            normalize(program.name) === normalize(programmeName) &&
            program.category.code === category
        );

        if (matches.length === 0) {
          if (!unmatched.has(category)) {
            unmatched.set(category, new Set());
          }

          unmatched.get(category)!.add(programmeName);
        }

        if (matches.length > 1) {
          if (!ambiguous.has(category)) {
            ambiguous.set(category, new Set());
          }

          ambiguous.get(category)!.add(programmeName);
        }
      }
    }
  }

  console.log("");
  console.log("==============================================");
  console.log("PROGRAMME MAPPING REFERENCE");
  console.log("==============================================");

  console.log("");
  console.log("DATABASE PROGRAMMES");
  console.log("----------------------------------------------");

  for (const program of programs) {
    console.log(
      `${program.id} | ${program.category.code} | ${program.name}`
    );
  }

  console.log("");
  console.log("==============================================");
  console.log("UNMATCHED SCHEDULE PROGRAMMES");
  console.log("==============================================");

  for (const [category, names] of unmatched) {
    console.log("");
    console.log(`[${category}]`);

    for (const name of names) {
      console.log(`SCHEDULE: ${name}`);

      const categoryPrograms = programs.filter(
        (program) => program.category.code === category
      );

      for (const program of categoryPrograms) {
        console.log(`  → ${program.id} | ${program.name}`);
      }

      console.log("");
    }
  }

  console.log("");
  console.log("==============================================");
  console.log("AMBIGUOUS PROGRAMMES");
  console.log("==============================================");

  for (const [category, names] of ambiguous) {
    console.log("");
    console.log(`[${category}]`);

    for (const name of names) {
      console.log(`SCHEDULE: ${name}`);

      const matches = programs.filter(
        (program) =>
          program.category.code === category &&
          normalize(program.name) === normalize(name)
      );

      for (const program of matches) {
        console.log(`  → ${program.id} | ${program.name}`);
      }

      console.log("");
    }
  }

  console.log("");
  console.log("==============================================");
  console.log("NO DATABASE CHANGES WERE MADE.");
  console.log("==============================================");
}

main()
  .catch((error) => {
    console.error("ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });