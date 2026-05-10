import cors from "cors";
import express, { type Request, type Response } from "express";
import { calculateHealthScore } from "../lib/scoring";
import { healthScoreInputSchema } from "../lib/healthSchema";

export function createExpressApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_request: Request, response: Response) => {
    response.json({ service: "SmartBank Financial Health Score™ Express API", status: "ok" });
  });

  app.post("/api/score", (request: Request, response: Response) => {
    const parsed = healthScoreInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({
        error: "Invalid health-score request",
        details: parsed.error.flatten()
      });
    }

    const result = calculateHealthScore(parsed.data);
    return response.json(result);
  });

  return app;
}
