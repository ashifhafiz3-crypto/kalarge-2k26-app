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

  if (!sheet) {
    throw new Error("IMPORT_READY sheet not found in the Excel file.");
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
  });

  console.log(`Found ${rows.length} rows in IMPORT_READY.`);
  console.log("Please check the remaining import logic before running this script.");
}

main()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });