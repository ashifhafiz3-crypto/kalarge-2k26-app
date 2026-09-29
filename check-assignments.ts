import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const assignments = await prisma.judgeAssignment.findMany({
    select: {
      judgeId: true,
      programId: true,
      status: true,
    },
    take: 10,
  });

  console.log(assignments);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });