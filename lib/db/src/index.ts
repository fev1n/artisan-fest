import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { lookup } from "node:dns/promises";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Resolve hostname to IPv4 to avoid ENETUNREACH on Railway (IPv6 unreachable)
const dbUrl = new URL(process.env.DATABASE_URL);
const { address } = await lookup(dbUrl.hostname, { family: 4 });
const ipv4Url = process.env.DATABASE_URL.replace(dbUrl.hostname, address);

export const pool = new Pool({
  connectionString: ipv4Url,
  ssl: { rejectUnauthorized: false },
});
export const db = drizzle(pool, { schema });

export * from "./schema";
