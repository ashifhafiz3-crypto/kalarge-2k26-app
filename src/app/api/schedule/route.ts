import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "KALARGE 2K26 final schedule",
    locked: true,
    source: "new schedule 2026 (2)(1).xlsx",
  });
}