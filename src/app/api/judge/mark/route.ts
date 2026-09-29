import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentJudge } from "@/lib/judge-auth";

export async function POST(request: Request) {
  try {
    const judge = await getCurrentJudge();

    if (!judge) {
      return NextResponse.json(
        { error: "Please log in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      programId,
      entryId,
      totalMark,
      judgementDetails,
    } = body;

    if (
      !programId ||
      !entryId ||
      typeof totalMark !== "number" ||
      !Number.isFinite(totalMark)
    ) {
      return NextResponse.json(
        { error: "programId, entryId and totalMark are required." },
        { status: 400 }
      );
    }

    const assignment = await prisma.judgeAssignment.findFirst({
      where: {
        judgeId: judge.id,
        programId,
        status: "ASSIGNED",
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "This programme is not assigned to this judge." },
        { status: 403 }
      );
    }

    const entry = await prisma.programEntry.findFirst({
      where: {
        id: entryId,
        programId,
        status: "ACTIVE",
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Entry not found or inactive." },
        { status: 404 }
      );
    }

    const existingSubmitted = await prisma.result.findFirst({
      where: {
        programId,
        status: { in: ["SUBMITTED", "APPROVED"] },
      },
    });

    if (existingSubmitted) {
      return NextResponse.json(
        { error: "This programme's results are already submitted and locked." },
        { status: 409 }
      );
    }

    const savedMark = await prisma.judgeMark.upsert({
      where: {
        judgeId_entryId: {
          judgeId: judge.id,
          entryId,
        },
      },
      update: {
        totalMark,
        judgementDetails: judgementDetails ?? null,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        judgeId: judge.id,
        programId,
        entryId,
        participantId: entry.participantId,
        houseId: entry.houseId,
        totalMark,
        judgementDetails: judgementDetails ?? null,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mark saved successfully.",
      mark: savedMark,
    });
  } catch (error) {
    console.error("JUDGE MARK SAVE ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to save mark.",
        details:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}