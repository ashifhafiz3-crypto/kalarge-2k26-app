import { NextResponse } from "next/server";
import { getCurrentJudge } from "@/lib/judge-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Identify the judge using the login session
    const judge = await getCurrentJudge();

    if (!judge) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Load only this judge's assigned programmes
    const assignments = await prisma.judgeAssignment.findMany({
      where: {
        judgeId: judge.id,
        status: "ASSIGNED",
      },
      include: {
        program: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        programId: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("JUDGE ASSIGNMENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load assignments",
      },
      { status: 500 }
    );
  }
}