import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL || "postgres://dummy:dummy@dummy.neon.tech/dummy";
const sql = neon(dbUrl);
export const db = drizzle(sql, { schema });
