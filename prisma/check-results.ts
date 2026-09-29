import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import "dotenv/config";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const results = await prisma.result.findMany({
    where: {
      programId: "KGP001",
    },
    include: {
      participant: true,
      house: true,
    },
    orderBy: {
      rank: "asc",
    },
  });

  console.log(
    JSON.stringify(
      results.map((r) => ({
        id: r.id,
        entryId: r.entryId,
        participant: r.participant.name,
        chestNo: r.participant.chestNo,
        house: r.house.name,
        mark: r.totalMark,
        rank: r.rank,
        status: r.status,
      })),
      null,
      2
    )
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
