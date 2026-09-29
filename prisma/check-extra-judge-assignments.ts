import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as XLSX from "xlsx";
import path from "path";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const file = path.join(
    process.cwd(),
    "prisma",
    "KALARGE_2K26_JUDGE_ASSIGNMENTS_FINAL_CONFIRMED.xlsx"
  );

  const workbook = XLSX.readFile(file);
  const sheet = workbook.Sheets["IMPORT_READY"];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

  const excelKeys = new Set(
    rows.map(
      (r) =>
        `${String(r.judge_id).trim()}|${String(r.program_id).trim()}`
    )
  );

  const assignments = await prisma.judgeAssignment.findMany({
    include: {
      judge: true,
      program: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  const extras = assignments.filter(
    (a) => !excelKeys.has(`${a.judgeId}|${a.programId}`)
  );

  console.log("");
  console.log("========================================");
  console.log(" EXTRA DATABASE ASSIGNMENTS");
  console.log("========================================");
  console.log(`Database total : ${assignments.length}`);
  console.log(`Excel total    : ${rows.length}`);
  console.log(`Extra          : ${extras.length}`);
  console.log("");

  for (const a of extras) {
    console.log(
      `${a.id} | ${a.judge.code} | ${a.judge.name} | ${a.program.code} | ${a.program.name}`
    );
  }

  console.log("");
  console.log("========================================");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });