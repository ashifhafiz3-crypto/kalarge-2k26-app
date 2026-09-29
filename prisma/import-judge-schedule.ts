import "dotenv/config";
import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const EXCEL_FILE = "programmes for judges(5).xlsx";

const MANUAL_MAPPING: Record<string, string> = {
  // GN
  "GN|പത്ര നിർമ്മാണം [URD]": "KGP088",
  "GN|ലൈവ് റിപ്പോർട്ട് (ENG)": "KGP098",
  "GN|വഅള്": "KGP099",
  "GN|സംഘഗാനം (ARB)": "KGP094",
  "GN|ഖുർആൻ ടാലന്റ് ഷോ": "KGP105",
  "GN|ലൈവ് ട്രാൻസ്‌ലേഷൻ": "KGP084",
  "GN|വുസൂലുസുവർ": "KGP025",
  // SSR
  "SSR|പ്രബന്ധം {MLM}": "KGP057",
  "SSR|പ്രബന്ധം {ARA}": "KGP059",
  "SSR|പ്രബന്ധം {URD}": "KGP060",
  "SSR|വിവർത്തനം {ENG-ARA}": "KGP065",
  "SSR|അറബി ഗാനം": "KGP081",
  "SSR|അറബി പ്രസംഗം": "KGP077",
  "SSR|ഉറുദു പ്രസംഗം": "KGP078",
  "SSR|ഉറുദു ഗാനം": "KGP082",
  "SSR|പിക്ക്&ടോക് (ENG)": "KGP080",
  "SSR|ക്യാപ്ഷൻ മേക്കിങ് {ENG}": "KGP067",
  "SSR|ടൈപ്പിംഗ്": "KGP071",
  "SSR|ന്യൂസ് മേക്കിങ് {ENG}": "KGP063",
  "SSR|ഖിറാഅത്ത്": "KGP075",

  // SR
  "SR|കയ്യെഴുത്ത് {ARA}": "KGP028",
  "SR|കയ്യെഴുത്ത് {ENG}": "KGP027",
  "SR|കയ്യെഴുത്ത് {MLM}": "KGP026",
  "SR|കയ്യെഴുത്ത് {URD}": "KGP029",
  "SR|ഗദ്യ വായന   {ENG}": "KGP033",
  "SR|പദപ്പയറ്റ് [ENG]": "KGP032",
  "SR|ടൈപ്പിംഗ്": "KGP038",
  "SR|അറബിഗാനം": "KGP050",
  "SR|ഉറുദു ഗാനം": "KGP051",
  "SR|ഉറുദു പ്രസംഗം": "KGP048",
  "SR|കഥ പറയൽ (ARA)": "KGP054",
  "SR|കഥ പറച്ചിൽ(MAL)": "KGP052",
  "SR|കഥ പറയൽ (ENG)": "KGP053",
  "SR|മലയാള ഗാനം": "KGP049",
  "SR|മലയാള പ്രസംഗം": "KGP047",
  "SR|സംഭാഷണം (ENG)": "KGP056",
  "SR|ഖിറാഅത്ത്": "KGP045",
  "SR|വിവർത്തനം {ARA-MAL}": "KGP037",

  // JR
  "JR|കയ്യെഴുത്ത് [ARA]": "KGP014",
  "JR|അറബിഗാനം": "KGP023",
  "JR|ഖിറാഅത്ത്": "KGP019",
  "JR|മദ്ഹഗാനം": "KGP024",
  "JR|മലയാള പ്രസംഗം": "KGP022",

  // SJR
  "SJR|ഖിറാഅത്ത്": "KGP007",
  "SJR|മദ്ഹഗാനം": "KGP009",
  "SJR|കഥപറച്ചിൽ": "KGP010",
  "SJR|സംഭാഷണം (MAL)": "KGP012",
  "SJR|മലയാള പ്രസംഗം": "KGP011",
};


function normalize(value: unknown): string {
  return String(value ?? "")
    .replace(/\u200b/g, "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
function cleanCategory(value: unknown): string | null {
  const text = normalize(value);

  if (text.includes("sjr")) return "SJR";
if (text.includes("ssr")) return "SSR";
if (text.includes("jr")) return "JR";
if (text.includes("sr")) return "SR";
if (text.includes("gn")) return "GN";
  return null;
}

function cleanProgramName(value: unknown): string {
  return String(value ?? "")
    .replace(/\u200b/g, "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  console.log("\n========================================");
  console.log(" JUDGE SCHEDULE IMPORT");
  console.log("========================================\n");

  const workbook = XLSX.readFile(EXCEL_FILE);

  const programs = await prisma.program.findMany({
    include: {
      category: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  const judges = await prisma.judge.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: {
      id: "asc",
    },
  });

const judgeMap = new Map<string, typeof judges[number]>();

for (const judge of judges) {
  judgeMap.set(judge.code, judge);
  judgeMap.set(judge.id, judge);

  const number = judge.code.replace(/\D/g, "").padStart(2, "0");
  judgeMap.set(`KGJ${number}`, judge);
}

  const programMap = new Map<string, typeof programs>();

  for (const program of programs) {
    const key =
      `${program.category.code}|${normalize(program.name)}`;

    const existing = programMap.get(key) ?? [];
    existing.push(program);
    programMap.set(key, existing);
  }

  let rowsFound = 0;
  let matched = 0;

  const assignments = new Set<string>();
  const unresolved = new Set<string>();
  const ambiguous = new Set<string>();

 for (const sheetName of workbook.SheetNames) {
  const normalizedSheetName =
    sheetName.replace(/^KG(\d{2,3})$/, (_, n) =>
      `KGJ${String(Number(n)).padStart(2, "0")}`
    );

  const judge =
    judgeMap.get(sheetName) ??
    judgeMap.get(normalizedSheetName);

    if (!judge) {
      console.log(`❌ JUDGE NOT FOUND: ${sheetName}`);
      continue;
    }

    console.log(`\n--- ${judge.code} | ${judge.name} ---`);

    const rows = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetName],
      {
        header: 1,
        defval: null,
      }
    ) as unknown[][];

    for (const row of rows) {
      const rawName = row[2];
      const category = cleanCategory(row[9]);

      if (!rawName || !category) continue;

      const programName = cleanProgramName(rawName);

      if (!programName) continue;

      rowsFound++;

      const manualKey =
        `${category}|${programName}`;

      const manualProgramId =
  MANUAL_MAPPING[manualKey];

      let programId = manualProgramId;

      if (!programId) {
        const key =
          `${category}|${normalize(programName)}`;

        const candidates = programMap.get(key) ?? [];

        if (candidates.length === 1) {
          programId = candidates[0].id;
        } else if (candidates.length > 1) {
          ambiguous.add(
            `${judge.code}|${category}|${programName} → ${candidates
              .map((p) => p.id)
              .join(", ")}`
          );
          continue;
        }
      }

      if (!programId) {
        unresolved.add(
          `${judge.code}|${category}|${programName}`
        );
        continue;
      }

      const assignmentKey =
        `${judge.id}|${programId}`;

      if (!assignments.has(assignmentKey)) {
        assignments.add(assignmentKey);
        matched++;

        const program = programs.find(
          (p) => p.id === programId
        );

        console.log(
          `✅ ${programId} | ${program?.name ?? "UNKNOWN"}`
        );
      }
    }
  }

  console.log("\n========================================");
  console.log(" DRY RUN SUMMARY");
  console.log("========================================");

  console.log(`Rows found:             ${rowsFound}`);
  console.log(`Matched assignments:    ${matched}`);
  console.log(`Unresolved:             ${unresolved.size}`);
  console.log(`Ambiguous:              ${ambiguous.size}`);

  if (unresolved.size) {
    console.log("\n========================================");
    console.log(" UNRESOLVED");
    console.log("========================================");

    for (const item of [...unresolved].sort()) {
      console.log(`❌ ${item}`);
    }
  }

  if (ambiguous.size) {
    console.log("\n========================================");
    console.log(" AMBIGUOUS");
    console.log("========================================");

    for (const item of [...ambiguous].sort()) {
      console.log(`⚠️ ${item}`);
    }
  }

  if (unresolved.size > 0 || ambiguous.size > 0) {
  console.log("\n❌ IMPORT STOPPED — unresolved or ambiguous assignments exist.");
  return;
}

console.log("\n========================================");
console.log(" IMPORTING TO DATABASE");
console.log("========================================");

let imported = 0;

for (const assignmentKey of assignments) {
  const [judgeId, programId] = assignmentKey.split("|");

  await prisma.judgeAssignment.upsert({
    where: {
      id: `JA-${judgeId}-${programId}`,
    },
    update: {
      status: "ACTIVE",
    },
    create: {
      id: `JA-${judgeId}-${programId}`,
      judgeId,
      programId,
      status: "ACTIVE",
    },
  });

  imported++;
}

console.log(`✅ Judge assignments imported: ${imported}`);

console.log("\n========================================");
console.log(" DATABASE IMPORT COMPLETE");
console.log("========================================");
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

main()
  .catch((error) => {
    console.error("\n❌ IMPORT ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });