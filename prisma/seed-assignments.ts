import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const assignments = [
  {
    id: "JA001",
    judgeId: "KGJ001",
    programId: "KGP001",
    assignedDate: null,
    status: "ACTIVE",
  },
  {
    id: "JA002",
    judgeId: "KGJ002",
    programId: "KGP002",
    assignedDate: null,
    status: "ACTIVE",
  },
  {
    id: "JA003",
    judgeId: "KGJ003",
    programId: "KGP003",
    assignedDate: null,
    status: "ACTIVE",
  },
];

async function main() {
  for (const assignment of assignments) {
    await prisma.judgeAssignment.upsert({
      where: { id: assignment.id },
      update: assignment,
      create: assignment,
    });
  }

  console.log(`${assignments.length} judge assignments seeded successfully.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });