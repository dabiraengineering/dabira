// One-off helper: run a .sql file against the Supabase project via the
// Management API. Usage: node scripts/run-sql.mjs <path-to-sql-file>
import fs from "node:fs";

const PROJECT_REF = "rcqwndhbiedwlrmgjhtw";
const token = process.env.SUPABASE_ACCESS_TOKEN;
const sqlPath = process.argv[2];

if (!token) {
  console.error("SUPABASE_ACCESS_TOKEN not set in environment");
  process.exit(1);
}
if (!sqlPath) {
  console.error("Usage: node scripts/run-sql.mjs <path-to-sql-file>");
  process.exit(1);
}

const query = fs.readFileSync(sqlPath, "utf8");

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  }
);

const text = await res.text();
console.log(`HTTP ${res.status}`);
console.log(text);
if (!res.ok) process.exit(1);
