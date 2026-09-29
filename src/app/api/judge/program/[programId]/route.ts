import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentJudge } from "@/lib/judge-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ programId: string }> }
) {
  try {
    const judge = await getCurrentJudge();

    if (!judge) {
      return NextResponse.json(
        { error: "Please log in." },
        { status: 401 }
      );
    }

    const { programId } = await params;

    const assignment = await prisma.judgeAssignment.findFirst({
      where: {
        judgeId: judge.id,
        programId,
        status: "ASSIGNED",
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "This programme is not assigned to you." },
        { status: 403 }
      );
    }

    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        category: true,
        entries: {
          where: { status: "ACTIVE" },
          include: {
            participant: true,
            house: true,
            result: true,
            judgeMarks: {
              where: {
                judgeId: judge.id,
              },
              select: {
                id: true,
                totalMark: true,
                judgeId: true,
                entryId: true,
                updatedAt: true,
                judgementDetails: true,
              },
            },
          },
          orderBy: {
            chestNo: "asc",
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error("PROGRAM API ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load program.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}