import { FastifyInstance } from "fastify";
import { query } from "../db.js";

export async function healthRoutes(server: FastifyInstance) {
  server.get("/", async () => {
    return {
      ok: true,
      service: "api",
      uptime: process.uptime()
    };
  });

  server.get("/ready", async (request, reply) => {
    try {
      await query("select 1");
      return { ok: true, db: "up" };
    } catch (error) {
      request.log.error({ error }, "db readiness failed");
      return reply.code(503).send({ ok: false, db: "down" });
    }
  });
}
