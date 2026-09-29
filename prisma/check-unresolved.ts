import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const programs = await prisma.program.findMany({
    include: { category: true },
    orderBy: { id: "asc" },
  });

  for (const p of programs) {
    if (p.category.code === "GN") {
      console.log(`${p.id} | ${p.name}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });