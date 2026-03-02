import { Pool, QueryResultRow } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

export const pool = new Pool({
  connectionString: databaseUrl,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Prevent idle client errors from crashing the process
pool.on("error", (err) => {
  console.error("[DB] Unexpected idle client error:", err.message);
});

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  const result = await pool.query<T>(text, params);
  return result.rows;
}
