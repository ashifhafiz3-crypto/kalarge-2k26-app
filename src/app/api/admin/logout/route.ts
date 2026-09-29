import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kalarge_admin_session")?.value;

    if (token) {
      await prisma.adminSession.deleteMany({
        where: {
          tokenHash: hashToken(token),
        },
      });
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set("kalarge_admin_session", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("ADMIN LOGOUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Logout failed.",
      },
      { status: 500 }
    );
  }
}
