import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const judges = [
  { username: "J01", name: "Mubashir Wafi" },
  { username: "J02", name: "Haris Hudawi" },
  { username: "J03", name: "Rabeeh Baqawi" },
  { username: "J04", name: "Aslam Faisy" },
  { username: "J05", name: "Hafiz Fayiz Hudawi" },
  { username: "J06", name: "Hafiz Sirajudheen Faisy" },
  { username: "J07", name: "Abdul Vahid Wafi" },
  { username: "J08", name: "Jabir Baqavi" },
  { username: "J09", name: "Suhail Baqavi" },
  { username: "J10", name: "Hafiz Ashif" },
];

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    console.log("Set a unique password for each judge.");
    console.log("Usernames will be J01 through J10.");
    console.log("Passwords are stored as bcrypt hashes, not plain text.\\n");

    for (const judgeInfo of judges) {
      const judge = await prisma.judge.findFirst({
        where: { name: judgeInfo.name },
        select: { id: true, name: true },
      });

      if (!judge) {
        throw new Error(
          `Judge not found in database: ${judgeInfo.name}. Check the name in your database before continuing.`
        );
      }

      const password = await rl.question(
        `Password for ${judgeInfo.username} (${judgeInfo.name}): `
      );

      if (password.length < 8) {
        throw new Error(
          `Password for ${judgeInfo.username} must be at least 8 characters.`
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await prisma.judge.update({
        where: { id: judge.id },
        data: {
          username: judgeInfo.username,
          passwordHash,
        },
      });

      console.log(`Saved credentials for ${judgeInfo.username}.\\n`);
    }

    console.log("All 10 judge passwords have been set.");
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("PASSWORD SETUP FAILED:", error);
  process.exitCode = 1;
});
