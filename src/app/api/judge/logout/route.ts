import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("judge_session")?.value;

  if (token) {
    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    await prisma.judgeSession.deleteMany({
      where: { tokenHash },
    });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("judge_session");

  return response;
}