// scripts/db-init.js  (ESM)
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL en .env");
  process.exit(1);
}

const isLocal = process.env.DATABASE_URL.includes("localhost");
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

const sqlPath = path.join(__dirname, "..", "sql", "init.sql");
if (!fs.existsSync(sqlPath)) {
  console.error("No se encontró sql/init.sql");
  process.exit(1);
}
const sql = fs.readFileSync(sqlPath, "utf8");

try {
  await pool.query(sql);
  console.log("✅ Tablas creadas/actualizadas correctamente.");
} catch (err) {
  console.error("❌ Error ejecutando init.sql:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
