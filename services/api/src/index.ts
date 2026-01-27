import "dotenv/config";
import { buildServer } from "./server.js";
import { validateEnv } from "./env.js";

validateEnv();

const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || "0.0.0.0";

const server = await buildServer();

try {
  await server.listen({ port, host });
  server.log.info({ port, host }, "api listening");
} catch (error) {
  server.log.error(error, "failed to start");
  process.exit(1);
}
