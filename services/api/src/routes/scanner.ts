import { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";

const runSchema = z.object({
  classScope: z.enum(["day", "swing", "invest"]),
  markets: z.array(z.enum(["us", "ca", "crypto"])).default(["us", "ca"])
});

export async function scannerRoutes(server: FastifyInstance) {
  // Pro Real-time Feed
  server.get("/", { preHandler: server.requireAuth }, async (request, reply) => {
    const { email_verified } = request.user;
    if (!email_verified) return reply.code(403).send({ error: "unverified" });

    const rows = await query(
      `SELECT s.*, sl.status as live_status
       FROM signals_live sl
       JOIN signals s ON s.id = sl.signal_id
       ORDER BY sl.last_seen DESC
       LIMIT 50`
    );

    return { data: rows };
  });

  server.post("/run", { preHandler: server.requireAuth }, async (request, reply) => {
    const parse = runSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const { classScope, markets } = parse.data;
    const { email_verified } = request.user;

    if (!email_verified) {
      return reply.code(403).send({ error: "email_unverified" });
    }

    return {
      accepted: true,
      classScope,
      markets,
      message: "scan queued"
    };
  });
}
