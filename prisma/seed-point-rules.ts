import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const rules = [
  // SJR
  ["PR001", "SJR", "INDIVIDUAL", 1, 10],
  ["PR002", "SJR", "INDIVIDUAL", 2, 5],
  ["PR003", "SJR", "INDIVIDUAL", 3, 3],

  // JR
  ["PR004", "JR", "INDIVIDUAL", 1, 10],
  ["PR005", "JR", "INDIVIDUAL", 2, 5],
  ["PR006", "JR", "INDIVIDUAL", 3, 3],

  // SR
  ["PR007", "SR", "INDIVIDUAL", 1, 10],
  ["PR008", "SR", "INDIVIDUAL", 2, 5],
  ["PR009", "SR", "INDIVIDUAL", 3, 3],

  // SSR
  ["PR010", "SSR", "INDIVIDUAL", 1, 10],
  ["PR011", "SSR", "INDIVIDUAL", 2, 5],
  ["PR012", "SSR", "INDIVIDUAL", 3, 3],

  // GN Individual
  ["PR013", "GN", "INDIVIDUAL", 1, 15],
  ["PR014", "GN", "INDIVIDUAL", 2, 10],
  ["PR015", "GN", "INDIVIDUAL", 3, 5],

  // SJR Group
  ["PR016", "SJR", "GROUP", 1, 15],
  ["PR017", "SJR", "GROUP", 2, 10],
  ["PR018", "SJR", "GROUP", 3, 5],

  // JR Group
  ["PR019", "JR", "GROUP", 1, 15],
  ["PR020", "JR", "GROUP", 2, 10],
  ["PR021", "JR", "GROUP", 3, 5],

  // SR Group
  ["PR022", "SR", "GROUP", 1, 15],
  ["PR023", "SR", "GROUP", 2, 10],
  ["PR024", "SR", "GROUP", 3, 5],

  // SSR Group
  ["PR025", "SSR", "GROUP", 1, 15],
  ["PR026", "SSR", "GROUP", 2, 10],
  ["PR027", "SSR", "GROUP", 3, 5],

  // GN Group
  ["PR028", "GN", "GROUP", 1, 15],
  ["PR029", "GN", "GROUP", 2, 10],
  ["PR030", "GN", "GROUP", 3, 5],
] as const;

async function main() {
  for (const [id, categoryCode, competitionType, rank, points] of rules) {
    await prisma.pointRule.upsert({
      where: { id },
      update: {
        categoryCode,
        competitionType,
        rank,
        points,
        status: "ACTIVE",
      },
      create: {
        id,
        categoryCode,
        competitionType,
        rank,
        points,
        status: "ACTIVE",
      },
    });
  }

  console.log(`${rules.length} point rules seeded successfully.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });