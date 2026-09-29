import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const judges = [
  {
    id: "KGJ001",
    code: "J01",
    name: "ashif",
    username: "ashif",
    passwordHash: "#0001",
    phone: "9876543321",
    status: "ACTIVE",
  },
  {
    id: "KGJ002",
    code: "J02",
    name: "nishmal",
    username: "nishmal",
    passwordHash: "#0002",
    phone: "9876543321",
    status: "ACTIVE",
  },
  {
    id: "KGJ003",
    code: "J03",
    name: "adil.t.t",
    username: "adil.t.t",
    passwordHash: "#0003",
    phone: "9876543321",
    status: "ACTIVE",
  },
];

async function main() {
  for (const judge of judges) {
    await prisma.judge.upsert({
      where: { id: judge.id },
      update: judge,
      create: judge,
    });
  }

  console.log(`${judges.length} judges seeded successfully.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });