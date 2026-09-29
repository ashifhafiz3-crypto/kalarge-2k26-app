import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL!,
  }),
});

async function main() {
  const judges = await prisma.judge.findMany({
    orderBy: { code: "asc" },
    include: {
      assignments: {
        orderBy: { programId: "asc" },
        include: {
          program: true,
        },
      },
    },
  });

  let total = 0;

  for (const judge of judges) {
    console.log(`\n${judge.code} - ${judge.name}: ${judge.assignments.length} assignments`);

    for (const assignment of judge.assignments) {
      console.log(`  ${assignment.program.code} - ${assignment.program.name}`);
    }

    total += judge.assignments.length;
  }

  console.log(`\n================================`);
  console.log(`TOTAL ASSIGNMENTS: ${total}`);
  console.log(`TOTAL JUDGES: ${judges.length}`);
  console.log(`================================`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());