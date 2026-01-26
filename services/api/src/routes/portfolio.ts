import { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";

const actSchema = z.object({
  alertId: z.string().uuid(),
  symbol: z.string().min(1).max(12),
  action: z.enum(["enter", "exit"]),
  price: z.number().positive(),
  decidedAt: z.string()
});

export async function portfolioRoutes(server: FastifyInstance) {
  server.post("/act", { preHandler: server.requireAuth }, async (request, reply) => {
    const parse = actSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const { uid } = request.user;
    const { alertId, symbol, action, price, decidedAt } = parse.data;

    await query(
      `insert into portfolio_events (uid, alert_id, symbol, action, price, decided_at, created_at)
       values ($1, $2, $3, $4, $5, $6, now())`,
      [uid, alertId, symbol, action, price, decidedAt]
    );

    return { ok: true };
  });
}
