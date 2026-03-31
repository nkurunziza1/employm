import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
// import routes from './routes/index.js';
import { errorHandler } from "./middlewares/errorHandler.js";
import { pingDatabase } from "./config/database.js";
import { env } from "./config/env.js";

/**
 * Express application factory — JSON body parser, security headers, API routes.
 */
export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get("/health", async (req, res, next) => {
    try {
      const db = await pingDatabase();
      res.json({
        ok: true,
        service: "employee-management-api",
        database: db.ok
          ? {
              running: true,
              host: env.DB_HOST,
              port: env.DB_PORT,
              name: env.DB_NAME,
            }
          : {
              running: false,
              error: db.message,
              ...(db.code && { code: db.code }),
            },
      });
    } catch (err) {
      next(err);
    }
  });

  //   app.use('/api', routes);

  app.use(errorHandler);

  return app;
}
