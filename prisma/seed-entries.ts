import "dotenv/config";
import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const filePath = path.join(process.cwd(), "PROGRAM_ENTRIES.xlsx");

type EntryRow = {
  entry_id: string;
  program_id: string;
  participant_id?: string;
  chest_no?: number;
  house_id: string;
  entry_type: string;
  status: string;
  group_member_ids?: string;
  group_member_chest_nos?: string;
};

async function main() {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json<EntryRow>(sheet, {
    defval: "",
  });

  console.log(`Found ${rows.length} entries in Excel.`);

  let count = 0;
  let memberCount = 0;

  for (const row of rows) {
    const entryId = String(row.entry_id).trim();
    const programId = String(row.program_id).trim();
    const houseId = String(row.house_id).trim();
    const entryType = String(row.entry_type).trim().toUpperCase();
    const status = String(row.status).trim().toUpperCase();

    if (!entryId || !programId || !houseId) {
      throw new Error(`Missing required data in entry: ${entryId || "unknown"}`);
    }

    let memberIds: string[] = [];
    let memberChestNos: number[] = [];

    if (entryType === "GROUP") {
      const rawIds = String(row.group_member_ids ?? "").trim();

      if (
        rawIds &&
        !rawIds.toUpperCase().startsWith("ALL MEMBERS")
      ) {
        memberIds = rawIds
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean);
      }

      const rawChestNos = String(
        row.group_member_chest_nos ?? ""
      ).trim();

      if (
        rawChestNos &&
        !rawChestNos.toUpperCase().startsWith("ALL MEMBERS")
      ) {
        memberChestNos = rawChestNos
          .split(",")
          .map((value) => Number(value.trim()))
          .filter(Number.isFinite);
      }

      // KGP089: use the supplied representative if no member list exists.
      if (memberIds.length === 0 && row.participant_id) {
        memberIds = [String(row.participant_id).trim()];
      }

      if (memberIds.length === 0) {
        throw new Error(
          `No participant IDs found for GROUP entry ${entryId}`
        );
      }
    }

    const participantId =
      String(row.participant_id ?? "").trim() ||
      (entryType === "GROUP" ? memberIds[0] : "");

    const chestNo =
      Number(row.chest_no) ||
      (entryType === "GROUP" ? memberChestNos[0] : 0);

    if (!participantId || !Number.isFinite(chestNo) || chestNo <= 0) {
      throw new Error(`Missing participant or chest number in ${entryId}`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.programEntry.upsert({
        where: { id: entryId },
        update: {
          programId,
          participantId,
          chestNo,
          houseId,
          entryType,
          status,
        },
        create: {
          id: entryId,
          programId,
          participantId,
          chestNo,
          houseId,
          entryType,
          status,
        },
      });

      if (entryType === "GROUP") {
        await tx.groupEntryMember.deleteMany({
          where: { entryId },
        });

        for (const [index, memberId] of memberIds.entries()) {
          await tx.groupEntryMember.create({
            data: {
              id: `${entryId}-${memberId}`,
              entryId,
              participantId: memberId,
            },
          });
          memberCount++;
        }
      }
    });

    count++;
  }

  console.log(`${count} entries imported successfully.`);
  console.log(`${memberCount} group memberships created.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });