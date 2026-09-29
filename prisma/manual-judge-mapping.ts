import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const MANUAL_MAPPING: Record<string, string> = {

  // ============================================================
  // GN
  // ============================================================

  "GN|പത്ര നിർമ്മാണം [URD]": "KGP088",

  // ============================================================
  // SSR
  // ============================================================

  "SSR|പ്രബന്ധം {MLM}": "KGP057",
  "SSR|വിവർത്തനം {ENG-ARA}": "KGP065",

  // ============================================================
  // SR
  // ============================================================

  "SR|കയ്യെഴുത്ത് {ARA}": "KGP028",
  "SR|ഗദ്യ വായന   {ENG}": "KGP033",
  "SR|പദപ്പയറ്റ് [ENG]": "KGP032",

  // ============================================================
  // JR
  // ============================================================

  "JR|കയ്യെഴുത്ത് [ARA]": "KGP014",
};

async function main() {
  console.log("\n========================================");
  console.log(" MANUAL JUDGE MAPPING CHECK");
  console.log("========================================\n");

  const programs = await prisma.program.findMany({
    include: {
      category: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  const programMap = new Map(
    programs.map((program) => [program.id, program])
  );

  const entries = Object.entries(MANUAL_MAPPING);

  console.log(`Manual mappings found: ${entries.length}\n`);

  let valid = 0;
  let invalid = 0;
  let categoryMismatch = 0;

  for (const [key, programId] of entries) {
    const separator = key.indexOf("|");

    if (separator === -1) {
      console.log(`❌ INVALID KEY: ${key}`);
      invalid++;
      continue;
    }

    const category = key.substring(0, separator).trim();
    const scheduleName = key.substring(separator + 1).trim();

    const program = programMap.get(programId);

    if (!program) {
      console.log(`❌ PROGRAM NOT FOUND: ${key} → ${programId}`);
      invalid++;
      continue;
    }

    const dbCategory = program.category.code;

    if (dbCategory !== category) {
      console.log(`❌ CATEGORY MISMATCH: ${key} → ${programId}`);
      console.log(`   Schedule category: ${category}`);
      console.log(`   DB category:       ${dbCategory}`);
      console.log(`   DB program:        ${program.name}`);
      console.log("");
      categoryMismatch++;
      continue;
    }

    console.log(
      `✅ ${category} | ${scheduleName} → ${programId} | ${program.name}`
    );

    valid++;
  }

  console.log("\n========================================");
  console.log(" SUMMARY");
  console.log("========================================");

  console.log(`Total mappings:       ${entries.length}`);
  console.log(`Valid mappings:       ${valid}`);
  console.log(`Invalid mappings:     ${invalid}`);
  console.log(`Category mismatches:  ${categoryMismatch}`);

  console.log("\nNO DATABASE CHANGES WERE MADE.");
}

main()
  .catch((error) => {
    console.error("\n❌ ERROR:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });