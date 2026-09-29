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

  if (!token) {
    return false;
  }

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
    return false;
  }

  return true;
}

export async function GET() {
  try {
    const isAdmin = await requireAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const results = await prisma.result.findMany({
      where: {
        status: "SUBMITTED",
      },
      include: {
        program: {
          include: {
            category: true,
          },
        },
        participant: true,
        house: true,
        entry: true,
      },
      orderBy: {
        submittedAt: "asc",
      },
    });

    // ONE PROGRAM = ONE RESULT GROUP
    const grouped = new Map<
      string,
      {
        programId: string;
        program: (typeof results)[number]["program"];
        results: typeof results;
      }
    >();

    for (const result of results) {
      const existing = grouped.get(result.programId);

      if (existing) {
        existing.results.push(result);
      } else {
        grouped.set(result.programId, {
          programId: result.programId,
          program: result.program,
          results: [result],
        });
      }
    }

    const groups = Array.from(grouped.values()).map((group) => ({
      ...group,
      results: [...group.results].sort(
        (a, b) => a.rank - b.rank
      ),
    }));

    return NextResponse.json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error("ADMIN RESULTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load admin results",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}