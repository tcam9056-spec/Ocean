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

// Render PostgreSQL requires SSL in production.
// rejectUnauthorized:false is safe for Render's managed certificates.
const sslConfig =
  process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false;

export const pool = new Pool({
  connectionString: dbUrl,
  ssl: sslConfig,
});

pool.on("error", (err) => {
  console.error("[DB] ❌ Lỗi kết nối pool:", err.message);
});

// Verify the connection is reachable on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("[DB] ❌ Không thể kết nối tới database:", err.message);
    console.error("[DB]    Kiểm tra: DATABASE_URL đúng chưa? SSL đúng chưa? IP whitelist chưa?");
    return;
  }
  console.info("[DB] ✅ Kết nối database thành công.");
  release();
});

export const db = drizzle(pool, { schema });

export * from "./schema";
