import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

async function main() {
  const groups = await prisma.programEntry.findMany({
    where: { program: { competitionType: "GROUP" } },
    select: {
      id: true,
      programId: true,
      houseId: true,
      groupMembers: { select: { participantId: true } },
    },
    orderBy: [{ programId: "asc" }, { houseId: "asc" }],
  });

  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const e of groups) {
    const key = `${e.programId}|${e.houseId}`;
    if (seen.has(key)) duplicates.push(key);
    seen.add(key);
  }

  console.log("GROUP ENTRIES:", groups.length);
  console.log("GROUP MEMBERSHIPS:", groups.reduce((n, e) => n + e.groupMembers.length, 0));
  console.log("DUPLICATE PROGRAM+HOUSE:", duplicates.length);
  if (duplicates.length) console.log(duplicates);
}

main().finally(() => prisma.$disconnect());
