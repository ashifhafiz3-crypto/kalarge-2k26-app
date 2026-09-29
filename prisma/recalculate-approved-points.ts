import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const results = await prisma.result.findMany({
    where: {
      status: "APPROVED",
    },
    include: {
      program: {
        include: {
          category: true,
        },
      },
    },
  });

  let updated = 0;

  for (const result of results) {
    const rule = await prisma.pointRule.findFirst({
      where: {
        categoryCode: result.program.category.code,
        competitionType: result.program.competitionType,
        rank: result.rank,
        status: "ACTIVE",
      },
    });

    if (!rule) {
      console.log(
        `No rule: ${result.id} ${result.program.category.code} ${result.program.competitionType} Rank ${result.rank}`
      );
      continue;
    }

    await prisma.result.update({
      where: {
        id: result.id,
      },
      data: {
        points: rule.points,
      },
    });

    console.log(
      `${result.id} → Rank ${result.rank} → ${rule.points} points`
    );

    updated++;
  }

  console.log(`Updated ${updated} approved results.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });