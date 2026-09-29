import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("\n========================================");
  console.log(" DATABASE JUDGE CHECK");
  console.log("========================================\n");

  const judges = await prisma.judge.findMany({
    orderBy: {
      code: "asc",
    },
  });

  console.log(`Total judges: ${judges.length}\n`);

  for (const judge of judges) {
    console.log(
      `${judge.id} | ${judge.code} | ${judge.name} | ${judge.username} | ${judge.status}`
    );
  }

  console.log("\n========================================");
  console.log(" ASSIGNMENTS");
  console.log("========================================\n");

  const assignments = await prisma.judgeAssignment.findMany({
    include: {
      judge: true,
      program: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  console.log(`Total assignments: ${assignments.length}\n`);

  for (const assignment of assignments) {
    console.log(
      `${assignment.id} | ${assignment.judge.code} | ${assignment.program.id} | ${assignment.program.name} | ${assignment.status}`
    );
  }

  console.log("\nNO DATABASE CHANGES WERE MADE.");
}

main()
  .catch((error) => {
    console.error("\nERROR:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });