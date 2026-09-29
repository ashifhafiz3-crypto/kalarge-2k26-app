import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const results = await prisma.result.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        program: {
          include: {
            category: true,
          },
        },
        participant: true,
        house: true,
      },
      orderBy: [
        {
          programId: "asc",
        },
        {
          rank: "asc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("PUBLIC RESULTS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load public results",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}