import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { closePool, pingDatabase } from "./config/database.js";

const app = createApp();

async function start() {
  const db = await pingDatabase();
  if (db.ok) {
    console.log(
      `[database] Running — connected to ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`
    );
  } else {
    console.warn(
      `[database] Not running or unreachable — ${db.message}${db.code ? ` [${db.code}]` : ""}`
    );
  }

  const server = app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });

  async function shutdown(signal) {
    console.log(`\n${signal} received, shutting down...`);
    server.close(async () => {
      await closePool();
      process.exit(0);
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

