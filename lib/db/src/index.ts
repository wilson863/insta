import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// pg Pool is lazy — it does NOT connect until the first query is executed.
// Using a placeholder when DATABASE_URL is absent lets the server start and
// pass health checks; any actual DB query will fail at that point with a
// clear connection error.  Set DATABASE_URL in your Railway environment to
// make the app fully operational.
const connectionString =
  process.env.DATABASE_URL ??
  "postgres://notset:notset@localhost:5432/notset";

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
