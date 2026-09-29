import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const marks = await prisma.judgeMark.findMany({
    where: {
      programId: "KGP001",
    },
    select: {
      judgeId: true,
      programId: true,
      entryId: true,
      totalMark: true,
    },
  });

  console.log(JSON.stringify(marks, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());