import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("kalarge_admin_session")?.value;

  if (!token) {
    redirect("/admin/login");
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
    redirect("/admin/login");
  }

  return children;
}
