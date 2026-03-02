import "dotenv/config";
import { buildServer } from "./server.js";
import { validateEnv } from "./env.js";
import { startBotMonitor } from "./services/bot-monitor.js";

validateEnv();

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || "0.0.0.0";

const server = await buildServer();

try {
  await server.listen({ port, host });
  server.log.info({ port, host }, "api listening");

  // Start the bot failsafe monitoring service
  startBotMonitor();
} catch (error) {
  server.log.error(error, "failed to start");
  process.exit(1);
}
