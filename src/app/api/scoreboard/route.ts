import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const houses = await prisma.house.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: {
        id: "asc",
      },
    });

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
        house: true,
      },
    });

    const scoreboard = houses.map((house) => {
      const houseResults = results.filter(
        (result) => result.houseId === house.id
      );

      const totalPoints = houseResults.reduce(
        (sum, result) => sum + result.points,
        0
      );

      const categories = ["SSR", "SR", "JR", "SJR", "GN"];

      const categoryScores = Object.fromEntries(
        categories.map((category) => [
          category,
          houseResults
            .filter(
              (result) =>
                result.program.category.code === category
            )
            .reduce(
              (sum, result) => sum + result.points,
              0
            ),
        ])
      );

      return {
        houseId: house.id,
        houseName: house.name,
        houseCode: house.code,
        color: house.color,
        totalPoints,
        categoryScores,
      };
    });

    scoreboard.sort(
      (a, b) => b.totalPoints - a.totalPoints
    );

    const rankedScoreboard = scoreboard.map(
      (house, index) => ({
        ...house,
        rank: index + 1,
      })
    );

    return NextResponse.json({
      success: true,
      scoreboard: rankedScoreboard,
    });
  } catch (error) {
    console.error("SCOREBOARD API ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load scoreboard",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}