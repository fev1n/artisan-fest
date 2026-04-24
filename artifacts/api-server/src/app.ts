import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
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

// In production the Express server serves the compiled React SPA.
// The web frontend builds to artifacts/web/dist/public.
// From the compiled binary at artifacts/api-server/dist/ we resolve up three
// levels to the repo root then back down to the web dist directory.
if (process.env.NODE_ENV === "production") {
  const staticDir = path.resolve(__dirname, "../../../artifacts/web/dist/public");
  app.use(express.static(staticDir));
  // SPA fallback — serve index.html for every non-API route so client-side
  // routing (/apply, /admin) works on direct load or page refresh.
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;

// Global error handler — must be last and have 4 params for Express to recognise it
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const e = err as { message?: string; status?: number; statusCode?: number; code?: string; detail?: string };
  logger.error({ err, pgCode: e.code, pgDetail: e.detail }, e.message ?? "Unhandled error");
  const status = e.status ?? e.statusCode ?? 500;
  res.status(status).json({ error: e.message ?? "Internal server error" });
});
