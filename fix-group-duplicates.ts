import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

async function main() {
  const entries = await prisma.programEntry.findMany({
    where: {
      program: { competitionType: "GROUP" },
    },
    include: {
      groupMembers: true,
      judgeMarks: true,
      result: true,
    },
    orderBy: { id: "asc" },
  });

  const groups = new Map<string, typeof entries>();

  for (const entry of entries) {
    const key = `${entry.programId}|${entry.houseId}`;
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  let removed = 0;
  let mergedGroups = 0;
  let conflicts = 0;

  for (const [key, list] of groups) {
    if (list.length <= 1) continue;

    // Prefer the row that already contains the GROUP membership data.
    const canonical =
      [...list].sort(
        (a, b) =>
          b.groupMembers.length - a.groupMembers.length ||
          b.judgeMarks.length - a.judgeMarks.length ||
          Number(!!b.result) - Number(!!a.result) ||
          a.id.localeCompare(b.id)
      )[0];

    const duplicates = list.filter((e) => e.id !== canonical.id);

    const allMemberIds = new Set<string>();

    for (const entry of list) {
      if (entry.participantId) allMemberIds.add(entry.participantId);
      for (const member of entry.groupMembers) {
        allMemberIds.add(member.participantId);
      }
    }

    await prisma.$transaction(async (tx) => {
      // Merge all team members into canonical entry.
      for (const participantId of allMemberIds) {
        await tx.groupEntryMember.upsert({
          where: {
            entryId_participantId: {
              entryId: canonical.id,
              participantId,
            },
          },
          update: {},
          create: {
            id: crypto.randomUUID(),
            entryId: canonical.id,
            participantId,
          },
        });
      }

      // Move judge marks to canonical.
      for (const duplicate of duplicates) {
        for (const mark of duplicate.judgeMarks) {
          const existing = await tx.judgeMark.findFirst({
            where: {
              entryId: canonical.id,
              judgeId: mark.judgeId,
            },
          });

          if (!existing) {
            await tx.judgeMark.update({
              where: { id: mark.id },
              data: { entryId: canonical.id },
            });
          } else {
            // Keep the most recently updated mark.
            const oldTime = new Date(existing.updatedAt).getTime();
            const newTime = new Date(mark.updatedAt).getTime();

            if (newTime > oldTime) {
              await tx.judgeMark.update({
                where: { id: existing.id },
                data: {
                  totalMark: mark.totalMark,
                  judgementDetails: mark.judgementDetails,
                  updatedAt: mark.updatedAt,
                },
              });
            }

            await tx.judgeMark.delete({
              where: { id: mark.id },
            });

            conflicts++;
          }
        }

        // Move result if canonical has none.
        if (duplicate.result) {
          const canonicalResult = await tx.result.findUnique({
            where: { entryId: canonical.id },
          });

          if (!canonicalResult) {
            await tx.result.update({
              where: { id: duplicate.result.id },
              data: { entryId: canonical.id },
            });
          } else {
            // Canonical result already exists; preserve it.
            await tx.result.delete({
              where: { id: duplicate.result.id },
            });

            conflicts++;
          }
        }

        await tx.programEntry.delete({
          where: { id: duplicate.id },
        });
      }
    });

    console.log(
      `MERGED ${key}: kept ${canonical.id}, removed ${duplicates.length}, members ${allMemberIds.size}`
    );

    mergedGroups++;
    removed += duplicates.length;
  }

  console.log("");
  console.log(`GROUPS MERGED: ${mergedGroups}`);
  console.log(`DUPLICATE ENTRIES REMOVED: ${removed}`);
  console.log(`JUDGING CONFLICTS RESOLVED: ${conflicts}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
