import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kalarge_admin_session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await prisma.adminSession.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { admin: true },
    });

    if (
      !session ||
      session.expiresAt < new Date() ||
      session.admin.status !== "ACTIVE"
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const judges = await prisma.judge.findMany({
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        name: true,
        username: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: session.admin.id,
        name: session.admin.name,
        username: session.admin.username,
      },
      judges,
    });
  } catch (error) {
    console.error("ACCOUNT LOAD ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load accounts." },
      { status: 500 }
    );
  }
}