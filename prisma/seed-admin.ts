import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

function hashPassword(password: string) {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
}

async function main() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error("ADMIN_PASSWORD is not set in .env");
  }

  await prisma.admin.upsert({
    where: {
      username: "Hafizashif",
    },
    update: {
      name: "Hafiz Ashif",
      passwordHash: hashPassword(password),
      status: "ACTIVE",
    },
    create: {
      id: "ADM001",
      name: "Hafiz Ashif",
      username: "Hafizashif",
      passwordHash: hashPassword(password),
      status: "ACTIVE",
    },
  });

  console.log("✅ Admin account created/updated successfully.");
}

main()
  .catch((error) => {
    console.error("❌ ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });