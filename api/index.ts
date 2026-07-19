/**
 * api/index.ts — Vercel Serverless Adapter
 * ─────────────────────────────────────────────────────────────────────────────
 * Đây là file adapter triển khai Vercel DUY NHẤT. Không thay đổi bất kỳ
 * business logic, database schema, API route, hay cấu trúc ứng dụng nào.
 *
 * Cách hoạt động:
 * 1. Vercel nhận request đến /api/* và forward đến file này (xem vercel.json).
 * 2. File này re-export Express app hiện có từ artifacts/api-server/src/app.ts.
 * 3. @vercel/node runtime bundle tất cả dependencies (bao gồm workspace packages)
 *    bằng esbuild khi deploy.
 * 4. Database schema được đồng bộ tại build-time thông qua `drizzle-kit push`
 *    (xem buildCommand trong vercel.json), nên không cần gọi runMigrations()
 *    trong serverless context.
 *
 * Lưu ý cần thiết lập trong Vercel Project Settings → Environment Variables:
 *   • DATABASE_URL  — Connection string PostgreSQL (bắt buộc cả build + runtime)
 *   • NODE_ENV      — Vercel tự set "production" (không cần thiết lập thủ công)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import app from "../artifacts/api-server/src/app";

// Re-export Express app trực tiếp.
// @vercel/node runtime chấp nhận bất kỳ handler (req, res) => void —
// Express app đã có đúng signature này.
export default app;
