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
  const workbook = XLSX.readFile(
    path.join(process.cwd(), "PROGRAM_ENTRIES.xlsx")
  );

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json<{
    entry_id: string;
    program_id: string;
    participant_id: string;
    chest_no: number;
    house_id: string;
    entry_type: string;
    status: string;
  }>(sheet);

  const programs = new Set(
    (await prisma.program.findMany({ select: { id: true } })).map((x) => x.id)
  );

  const participants = new Set(
    (await prisma.participant.findMany({ select: { id: true } })).map(
      (x) => x.id
    )
  );

  const houses = new Set(
    (await prisma.house.findMany({ select: { id: true } })).map((x) => x.id)
  );

  console.log("Database:");
  console.log("Programs:", programs.size);
  console.log("Participants:", participants.size);
  console.log("Houses:", houses.size);
  console.log("");

  const missing = rows.filter(
    (row) =>
      !programs.has(row.program_id) ||
      !participants.has(row.participant_id) ||
      !houses.has(row.house_id)
  );

  console.log("Missing parent records:", missing.length);

  for (const row of missing.slice(0, 20)) {
    console.log({
      entry_id: row.entry_id,
      program_id: row.program_id,
      participant_id: row.participant_id,
      house_id: row.house_id,
      missing_program: !programs.has(row.program_id),
      missing_participant: !participants.has(row.participant_id),
      missing_house: !houses.has(row.house_id),
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());