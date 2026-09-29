import "dotenv/config";
import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const FILE = "programmes for judges(4).xlsx";

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\{[^}]*\}/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/[.…\-–—]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[.:;,!?'"“”‘’()]/g, "")
    .toLowerCase()
    .trim();
}

function categoryCode(value: unknown): string | null {
  const text = String(value ?? "").toUpperCase().trim();

  const match = text.match(/\((SJ|SJR|JR|SR|SSR|GN)\)/);
  if (!match) return null;

  const code = match[1];

  if (code === "SJ") return "SJR";

  return code;
}

async function main() {
  const workbook = XLSX.readFile(FILE);

  const programs = await prisma.program.findMany({
    include: {
      category: true,
    },
  });

  console.log(`Programs in database: ${programs.length}`);
  console.log(`Excel sheets: ${workbook.SheetNames.length}`);
  console.log("");

  let totalFound = 0;
  let totalMatched = 0;
  let totalUnmatched = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    }) as unknown[][];

    let judgeId = "";

    for (const row of rows) {
      for (const cell of row) {
        const value = String(cell ?? "").trim();

        if (/^KGJ\d{3}$/i.test(value)) {
          judgeId = value.toUpperCase();
          break;
        }
      }

      if (judgeId) break;
    }

    if (!judgeId) {
      console.log(`⚠️ ${sheetName}: Judge ID not found`);
      continue;
    }

    console.log(`==============================`);
    console.log(`${judgeId} — ${sheetName}`);
    console.log(`==============================`);

    const foundInSheet = new Set<string>();

    for (const row of rows) {
      for (let i = 0; i < row.length; i++) {
        const cat = categoryCode(row[i]);

        if (!cat) continue;

        let nameCell = "";

        for (let j = i - 1; j >= 0; j--) {
          const candidate = String(row[j] ?? "").trim();

          if (!candidate) continue;

          // Skip time/date cells
          if (
            /^\d{1,2}[:.]\d{2}/.test(candidate) ||
            /^\d{2}\/\d{2}\/\d{4}/.test(candidate) ||
            /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/i.test(candidate)
          ) {
            continue;
          }

          nameCell = candidate;
          break;
        }

        if (!nameCell) continue;

        const key = `${normalize(nameCell)}|${cat}`;

        if (foundInSheet.has(key)) continue;
        foundInSheet.add(key);

        totalFound++;

        const matches = programs.filter(
          (p) =>
            normalize(p.name) === normalize(nameCell) &&
            p.category.code === cat
        );

        if (matches.length === 1) {
          const program = matches[0];

          totalMatched++;

          console.log(
            `✅ ${program.id} | ${cat} | ${program.name}`
          );
        } else if (matches.length === 0) {
          totalUnmatched++;

          console.log(
            `❌ NOT FOUND | ${cat} | ${nameCell}`
          );
        } else {
          console.log(
            `⚠️ MULTIPLE MATCHES | ${cat} | ${nameCell} | ${matches
              .map((m) => m.id)
              .join(", ")}`
          );
        }
      }
    }

    console.log("");
  }

  console.log("================================");
  console.log("DRY RUN SUMMARY");
  console.log("================================");
  console.log(`Programme entries found : ${totalFound}`);
  console.log(`Matched                 : ${totalMatched}`);
  console.log(`Unmatched               : ${totalUnmatched}`);
  console.log("");
  console.log("DATABASE WAS NOT CHANGED.");
}

main()
  .catch((error) => {
    console.error("ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });