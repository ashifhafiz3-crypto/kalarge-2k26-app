import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const entries = await prisma.programEntry.findMany({
    orderBy: {
      id: "asc",
    },
  });

  console.log(`Found ${entries.length} program entries.`);

  let count = 0;

  for (const entry of entries) {
    await prisma.result.upsert({
      where: {
        entryId: entry.id,
      },
      update: {},
      create: {
        id: `KGR${String(count + 1).padStart(3, "0")}`,
        programId: entry.programId,
        entryId: entry.id,
        participantId: entry.participantId,
        houseId: entry.houseId,
        totalMark: 0,
        rank: 0,
        points: 0,
        status: "PENDING",
      },
    });

    count++;
  }

  console.log(`${count} results seeded successfully.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });