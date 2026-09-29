import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
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
    const { accountType, id, username, password } = body;

    if (accountType !== "admin" && accountType !== "judge") {
      return NextResponse.json(
        { success: false, error: "Invalid account type." },
        { status: 400 }
      );
    }

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { success: false, error: "Account ID is required." },
        { status: 400 }
      );
    }

    if (
      (username !== undefined &&
        (typeof username !== "string" || !username.trim())) ||
      (password !== undefined && typeof password !== "string")
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 400 }
      );
    }

    const cleanUsername =
      typeof username === "string" ? username.trim() : undefined;

    if (cleanUsername !== undefined && cleanUsername.length < 3) {
      return NextResponse.json(
        { success: false, error: "Username must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (password !== undefined && password.length > 0 && password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    if (password !== undefined && password.length === 0) {
      return NextResponse.json(
        { success: false, error: "Password cannot be empty." },
        { status: 400 }
      );
    }

    if (accountType === "admin") {
      if (id !== session.admin.id) {
        return NextResponse.json(
          { success: false, error: "You can only update your own admin account." },
          { status: 403 }
        );
      }

      if (cleanUsername === undefined && password === undefined) {
        return NextResponse.json(
          { success: false, error: "No changes provided." },
          { status: 400 }
        );
      }

      const data: { username?: string; passwordHash?: string } = {};

      if (cleanUsername !== undefined) data.username = cleanUsername;
      if (password !== undefined) data.passwordHash = hashPassword(password);

      await prisma.$transaction(async (tx) => {
        await tx.admin.update({
          where: { id },
          data,
        });

        if (password !== undefined) {
          await tx.adminSession.deleteMany({
            where: { adminId: id },
          });
        }
      });

      const response = NextResponse.json({
        success: true,
        message:
          password !== undefined
            ? "Admin account updated. Please log in again."
            : "Admin username updated successfully.",
        requiresLogin: password !== undefined,
      });

      if (password !== undefined) {
        response.cookies.set("kalarge_admin_session", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          expires: new Date(0),
          path: "/",
        });
      }

      return response;
    }

    const judge = await prisma.judge.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!judge) {
      return NextResponse.json(
        { success: false, error: "Judge not found." },
        { status: 404 }
      );
    }

    if (cleanUsername === undefined && password === undefined) {
      return NextResponse.json(
        { success: false, error: "No changes provided." },
        { status: 400 }
      );
    }

    const judgeData: { username?: string; passwordHash?: string } = {};

    if (cleanUsername !== undefined) {
      judgeData.username = cleanUsername;
    }

    if (password !== undefined) {
      judgeData.passwordHash = await bcrypt.hash(password, 12);
    }

    await prisma.$transaction(async (tx) => {
      await tx.judge.update({
        where: { id },
        data: judgeData,
      });

      if (password !== undefined) {
        await tx.judgeSession.deleteMany({
          where: { judgeId: id },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message:
        password !== undefined
          ? "Judge account updated. The judge must log in again."
          : "Judge username updated successfully.",
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "That username is already in use." },
        { status: 409 }
      );
    }

    console.error("ACCOUNT UPDATE ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update account." },
      { status: 500 }
    );
  }
}