import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("kalarge_admin_session")?.value;

  if (!token) return false;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: true },
  });

  return !!(
    session &&
    session.expiresAt >= new Date() &&
    session.admin.status === "ACTIVE"
  );
}

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const count = await prisma.result.count({
      where: { status: "SUBMITTED" },
    });

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("PENDING COUNT ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load pending count" },
      { status: 500 }
    );
  }
}