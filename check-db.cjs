const Database = require("better-sqlite3");

const db = new Database("dev.db", { readonly: true });

const tables = [
  "Admin",
  "Judge",
  "JudgeAssignment",
  "ProgramEntry",
  "Program",
  "Result"
];

for (const table of tables) {
  try {
    const row = db
      .prepare(`SELECT COUNT(*) AS count FROM "${table}"`)
      .get();

    console.log(`${table}: ${row.count}`);
  } catch (error) {
    console.log(`${table}: table missing`);
  }
}

db.close();