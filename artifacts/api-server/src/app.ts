import path from "path";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const staticDir = path.resolve(__dirname, "../../song-nuoc/dist/public");
  // Hashed asset files (JS/CSS/fonts) are immutable — cache for 1 year.
  // index.html and other un-hashed files must revalidate on every request.
  app.use(
    express.static(staticDir, {
      etag: true,
      lastModified: true,
      setHeaders(res, filePath) {
        if (/\.[0-9a-f]{8,}\.(js|css|woff2?|png|svg|webp|avif)$/i.test(filePath)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "no-cache");
        }
      },
    })
  );
  app.get("{*path}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : String(err);
  logger.error({ err, method: req.method, url: req.url }, "Unhandled route error");
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error", detail: message });
  }
});

export default app;
