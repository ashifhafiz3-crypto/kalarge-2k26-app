import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    const judge = await prisma.judge.findUnique({
      where: { username: username.trim() },
    });

    if (
      !judge ||
      judge.status !== "ACTIVE" ||
      !(await bcrypt.compare(password, judge.passwordHash))
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const sessionId = randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.judgeSession.create({
      data: {
        id: sessionId,
        judgeId: judge.id,
        tokenHash,
        expiresAt,
      },
    });

    const response = NextResponse.json({
      success: true,
      judge: {
        id: judge.id,
        code: judge.code,
        name: judge.name,
      },
    });

    response.cookies.set("judge_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("JUDGE LOGIN ERROR:", error);

    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
