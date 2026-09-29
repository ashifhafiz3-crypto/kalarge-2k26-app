const Database = require("better-sqlite3");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
require("dotenv").config();

const sqlite = new Database("dev.db", { readonly: true });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const tables = [
  "House",
  "Category",
  "CategoryEligibility",
  "Participant",
  "Program",
  "Judge",
  "JudgeAssignment",
  "ProgramEntry",
  "GroupEntryMember",
  "PointRule",
  "Admin",
  "AdminSession",
  "JudgeSession",
  "DisplayConfig",
  "DisplayEvent",
  "Result",
  "JudgeMark",
];

async function main() {
  console.log("Starting migration...");

  for (const table of tables) {
    const rows = sqlite.prepare(`SELECT * FROM "${table}"`).all();

    if (!rows.length) {
      console.log(`${table}: 0 rows`);
      continue;
    }

    const model = prisma[table.charAt(0).toLowerCase() + table.slice(1)];

    if (!model) {
      throw new Error(`Prisma model not found: ${table}`);
    }

    let inserted = 0;
    let skipped = 0;

    for (const row of rows) {
      try {
        await model.create({
          data: row,
        });
        inserted++;
      } catch (error) {
        if (error.code === "P2002") {
          skipped++;
        } else {
          throw new Error(`${table} (${row.id}): ${error.message}`);
        }
      }
    }

    console.log(`${table}: inserted ${inserted}, skipped ${skipped}`);
  }

  console.log("Migration completed.");
}

main()
  .catch((error) => {
    console.error("Migration stopped:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    sqlite.close();
    await prisma.$disconnect();
  });