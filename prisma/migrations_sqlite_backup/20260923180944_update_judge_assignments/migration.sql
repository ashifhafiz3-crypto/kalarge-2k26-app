-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JudgeAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judgeId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "assignedDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    CONSTRAINT "JudgeAssignment_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JudgeAssignment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_JudgeAssignment" ("assignedDate", "id", "judgeId", "programId", "status") SELECT "assignedDate", "id", "judgeId", "programId", "status" FROM "JudgeAssignment";
DROP TABLE "JudgeAssignment";
ALTER TABLE "new_JudgeAssignment" RENAME TO "JudgeAssignment";
CREATE UNIQUE INDEX "JudgeAssignment_judgeId_programId_key" ON "JudgeAssignment"("judgeId", "programId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
