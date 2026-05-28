import express from "express";

const router = express.Router();

router.get("/healthz", (_req, res) => {
  return res.json({
    status: "ok",
  });
});

export default router;