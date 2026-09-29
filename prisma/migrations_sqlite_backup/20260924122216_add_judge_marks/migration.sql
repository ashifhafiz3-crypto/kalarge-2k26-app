-- CreateTable
CREATE TABLE "JudgeMark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "judgeId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "houseId" TEXT NOT NULL,
    "totalMark" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JudgeMark_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "Judge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JudgeMark_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JudgeMark_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "ProgramEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JudgeMark_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JudgeMark_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "JudgeMark_programId_idx" ON "JudgeMark"("programId");

-- CreateIndex
CREATE INDEX "JudgeMark_judgeId_idx" ON "JudgeMark"("judgeId");

-- CreateIndex
CREATE UNIQUE INDEX "JudgeMark_judgeId_entryId_key" ON "JudgeMark"("judgeId", "entryId");
