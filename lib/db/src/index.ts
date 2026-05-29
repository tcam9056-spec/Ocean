import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error(
    "[DB] ❌ Lỗi: Biến môi trường DATABASE_URL chưa được cấu hình. " +
    "Hãy thêm DATABASE_URL vào phần Environment Variables trên Render/Koyeb."
  );
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

// Mask password for safe logging: postgresql://user:****@host/db
const maskedUrl = dbUrl.replace(/:([^@]+)@/, ":****@");
console.info(`[DB] Đang kết nối tới database tại ${maskedUrl}`);

export const pool = new Pool({ connectionString: dbUrl });
export const db = drizzle(pool, { schema });

pool.on("error", (err) => {
  console.error("[DB] Lỗi kết nối pool:", err.message);
});

export * from "./schema";
