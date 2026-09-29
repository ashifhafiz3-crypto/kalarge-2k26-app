import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentJudge } from "@/lib/judge-auth";
import { randomUUID } from "node:crypto";

type SubmittedResult = {
  entryId: string;
  totalMark: number;
  rank: number;
};

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
    const { programId, results } = body as {
      programId?: string;
      results?: SubmittedResult[];
    };

    if (
      typeof programId !== "string" ||
      !programId ||
      !Array.isArray(results) ||
      results.length === 0
    ) {
      return NextResponse.json(
        { error: "programId and results are required." },
        { status: 400 }
      );
    }

    // Get programme and its maximum mark.
    const program = await prisma.program.findUnique({
      where: { id: programId },
      select: {
        id: true,
        maxMark: true,
        status: true,
      },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Programme not found." },
        { status: 404 }
      );
    }

    // Check judge assignment.
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

    // Validate entries, marks and ranks.
    const entryIds = results.map((item) => item.entryId);

    if (
      results.some(
        (item) =>
          !item ||
          typeof item.entryId !== "string" ||
          !item.entryId ||
          !Number.isInteger(item.totalMark) ||
          item.totalMark < 0 ||
          item.totalMark > program.maxMark ||
          !Number.isInteger(item.rank) ||
          item.rank < 1 ||
          item.rank > 3
      )
    ) {
      return NextResponse.json(
        {
          error: `Each result must have a valid entry, a mark from 0 to ${program.maxMark}, and a rank of 1, 2, or 3.`,
        },
        { status: 400 }
      );
    }

    // One participant cannot be submitted more than once.
    if (new Set(entryIds).size !== entryIds.length) {
      return NextResponse.json(
        { error: "The same entry cannot be submitted more than once." },
        { status: 400 }
      );
    }

    // Multiple participants can share the same rank.
    // However, each entry must belong to this programme.
    const entries = await prisma.programEntry.findMany({
      where: {
        id: { in: entryIds },
        programId,
        status: "ACTIVE",
      },
    });

    if (entries.length !== entryIds.length) {
      return NextResponse.json(
        {
          error:
            "One or more entries do not belong to this programme or are inactive.",
        },
        { status: 400 }
      );
    }

    // Do not allow resubmission after submission or approval.
    const existingSubmitted = await prisma.result.findFirst({
      where: {
        programId,
        status: {
          in: ["SUBMITTED", "APPROVED"],
        },
      },
    });

    if (existingSubmitted) {
      return NextResponse.json(
        {
          error:
            "This programme's results have already been submitted and are locked.",
          status: existingSubmitted.status,
        },
        { status: 409 }
      );
    }

    // Save every submitted result.
    // Multiple entries may have the same rank.
    const submittedResults = await prisma.$transaction(
      results.map((item) => {
        const entry = entries.find(
          (candidate) => candidate.id === item.entryId
        );

        if (!entry) {
          throw new Error(`Entry not found: ${item.entryId}`);
        }

        return prisma.result.upsert({
          where: {
            entryId: item.entryId,
          },
          create: {
            id: randomUUID(),
            programId,
            entryId: item.entryId,
            participantId: entry.participantId,
            houseId: entry.houseId,
            totalMark: item.totalMark,
            rank: item.rank,
            status: "SUBMITTED",
            submittedAt: new Date(),
          },
          update: {
            programId,
            participantId: entry.participantId,
            houseId: entry.houseId,
            totalMark: item.totalMark,
            rank: item.rank,
            status: "SUBMITTED",
            submittedAt: new Date(),
            approvedAt: null,
            approvedBy: null,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: "Results submitted successfully and locked.",
      count: submittedResults.length,
      results: submittedResults,
    });
  } catch (error) {
    console.error("JUDGE RESULT SUBMIT ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to submit results.",
        details:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}