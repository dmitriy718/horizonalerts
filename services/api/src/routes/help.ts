import { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";

const ticketSchema = z.object({
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(2000)
});

export async function helpRoutes(server: FastifyInstance) {
  server.post("/ticket", { preHandler: server.requireAuth }, async (request, reply) => {
    const parse = ticketSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const { uid, email } = request.user;
    const { subject, message } = parse.data;

    await query(
      `insert into help_tickets (uid, subject, message, status, created_at, email)
       values ($1, $2, $3, 'open', now(), $4)`,
      [uid, subject, message, email]
    );

    return { ok: true };
  });
}
