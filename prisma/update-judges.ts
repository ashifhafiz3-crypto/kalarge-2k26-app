import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const JUDGES = [
  ["KGJ001", "J01", "Mubashir Wafi", "mubashir wafi", "9645024464"],
  ["KGJ002", "J02", "Haris Hudawi", "harishudawi", "9946708044"],
  ["KGJ003", "J03", "Rabeeh Baqawi", "rabeehbaqawi", "9846574892"],
  ["KGJ004", "J04", "Aslam Faisy", "aslamfaisy", "8848673690"],
  ["KGJ005", "J05", "Hafiz Fayiz Hudawi", "hafizfayizhudawi", "9562494250"],
  ["KGJ006", "J06", "Hafiz Sirajudheen Faisy", "hafizsirajudheenfaisy", "8136856016"],
  ["KGJ007", "J07", "Abdul Vahid Wafi", "abdulvahidwafi", "9562676343"],
  ["KGJ008", "J08", "Jabir Baqavi", "jabirbaqavi", "9633667913"],
  ["KGJ009", "J09", "Suhail Baqavi", "suhailbaqavi", "7559875123"],
  ["KGJ010", "J10", "Hafiz Ashif", "hafizashif", "9778162537"],
] as const;

async function main() {
  console.log("\n========================================");
  console.log(" UPDATE JUDGE MASTER");
  console.log("========================================\n");

  for (const [id, code, name, username, phone] of JUDGES) {
    const existing = await prisma.judge.findUnique({
      where: { id },
    });

    if (existing) {
      await prisma.judge.update({
        where: { id },
        data: {
          code,
          name,
          username,
          phone,
          status: "ACTIVE",
        },
      });

      console.log(`UPDATED: ${id} | ${name}`);
    } else {
      await prisma.judge.create({
        data: {
          id,
          code,
          name,
          username,
          passwordHash: "#0001",
          phone,
          status: "ACTIVE",
        },
      });

      console.log(`ADDED:   ${id} | ${name}`);
    }
  }

  console.log("\n========================================");
  console.log(" JUDGE MASTER UPDATED");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("\nERROR:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });