import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Deeper health check: verifies DB connectivity and table existence
router.get("/healthz/db", async (_req, res) => {
  try {
    const client = await pool.connect();
    try {
      // Check both required tables exist
      const result = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('shelves', 'artworks')
        ORDER BY table_name
      `);
      const found = result.rows.map((r: { table_name: string }) => r.table_name);
      const shelvesOk = found.includes("shelves");
      const artworksOk = found.includes("artworks");

      if (!shelvesOk || !artworksOk) {
        res.status(503).json({
          status: "error",
          db: "connected",
          tables: { shelves: shelvesOk, artworks: artworksOk },
          hint: "Tables missing — run: pnpm run db:push",
        });
        return;
      }

      res.json({
        status: "ok",
        db: "connected",
        tables: { shelves: true, artworks: true },
      });
    } finally {
      client.release();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(503).json({
      status: "error",
      db: "unreachable",
      detail: message,
      hint: "Check DATABASE_URL and SSL settings on Render.",
    });
  }
});

export default router;
