import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

async function main() {
  console.log("Group entries:", await prisma.programEntry.count({
    where: { entryType: "GROUP" },
  }));
  console.log("Group memberships:", await prisma.groupEntryMember.count());

  const entries = await prisma.programEntry.findMany({
    where: { programId: "KGP089" },
    include: { groupMembers: true },
    orderBy: { houseId: "asc" },
  });

  console.log("KGP089:", JSON.stringify(entries, null, 2));
}

main().finally(() => prisma.$disconnect());
