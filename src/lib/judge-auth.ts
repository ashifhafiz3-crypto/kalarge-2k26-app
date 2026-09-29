import { cookies } from "next/headers";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export async function getCurrentJudge() {
  const cookieStore = await cookies();
  const token = cookieStore.get("judge_session")?.value;

  if (!token) return null;

  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const session = await prisma.judgeSession.findUnique({
    where: { tokenHash },
    include: { judge: true },
  });

  if (!session || session.expiresAt <= new Date()) {
    return null;
  }

  if (session.judge.status !== "ACTIVE") {
    return null;
  }

  return session.judge;
}