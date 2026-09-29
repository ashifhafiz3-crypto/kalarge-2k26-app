import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const programId = body.programId;

    if (typeof programId !== "string" || !programId.trim()) {
      return NextResponse.json(
        { success: false, error: "Valid programId is required" },
        { status: 400 }
      );
    }

    const approvedAt = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const program = await tx.program.findUnique({
        where: { id: programId },
        select: { id: true },
      });

      if (!program) {
        throw new Error("PROGRAM_NOT_FOUND");
      }

      const updated = await tx.result.updateMany({
        where: {
          programId,
          status: "SUBMITTED",
        },
        data: {
          status: "APPROVED",
          approvedAt,
          approvedBy: session.admin.id,
        },
      });

      return updated.count;
    });

    if (result === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No submitted results are awaiting approval.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      approvedCount: result,
      message: `${result} result(s) approved successfully.`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PROGRAM_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Programme not found." },
        { status: 404 }
      );
    }

    console.error("GROUP RESULT APPROVAL ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to approve programme results." },
      { status: 500 }
    );
  }
}