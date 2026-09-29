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

  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    include: {
      admin: true,
    },
  });

  if (
    !session ||
    session.expiresAt < new Date() ||
    session.admin.status !== "ACTIVE"
  ) {
    return null;
  }

  return session.admin;
}

export async function POST() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const now = new Date();
    const durationSeconds = 240;

    const event = await prisma.displayEvent.create({
      data: {
        type: "CHAMPION_REVEAL",
        payload: JSON.stringify({
          startedAt: now.toISOString(),
          durationSeconds,
          startedBy: admin.id,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Champion reveal started.",
      eventId: event.id,
      startedAt: now.toISOString(),
      durationSeconds,
    });
  } catch (error) {
    console.error("CHAMPION REVEAL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to start champion reveal.",
      },
      { status: 500 }
    );
  }
}