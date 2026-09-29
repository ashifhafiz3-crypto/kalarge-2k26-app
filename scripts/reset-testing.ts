import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// Load Next.js environment variables
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Check your .env file."
  );
}

const adapter = new PrismaBetterSqlite3({
  url: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

async function resetTesting() {
  try {
    console.log("Starting KALARGE testing reset...");

    await prisma.$transaction(async (tx) => {
      const deletedResults = await tx.result.deleteMany({});
      console.log(`Deleted ${deletedResults.count} results.`);

      const deletedMarks = await tx.judgeMark.deleteMany({});
      console.log(`Deleted ${deletedMarks.count} judge marks.`);
    });

    console.log("Testing data reset successfully!");
  } catch (error) {
    console.error("RESET FAILED:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

resetTesting();