import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const marks = await prisma.judgeMark.findMany({
    where: {
      programId: "SJR001",
    },
  });

  console.log("ALL JudgeMarks for SJR001:");
  console.log(JSON.stringify(marks, null, 2));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });