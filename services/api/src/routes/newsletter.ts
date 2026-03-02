import { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";

const SubscribeSchema = z.object({
  email: z.string().email(),
  lists: z.array(z.enum(["stock_alerts", "weekly_newsletter", "product_updates"])).min(1),
  source: z.string().max(100).optional(),
});

export async function newsletterRoutes(server: FastifyInstance) {
  /** POST /newsletter/subscribe — Public, no auth required */
  server.post("/subscribe", { preHandler: [server.rateLimit({ max: 3, timeWindow: '1 minute' })] }, async (req, reply) => {
    let body;
    try {
      body = SubscribeSchema.parse(req.body);
    } catch (e: unknown) {
      const details = e instanceof z.ZodError ? e.flatten().fieldErrors : undefined;
      return reply.code(400).send({ error: "invalid_request", ...(details ? { details } : {}) });
    }

    try {
      for (const list of body.lists) {
        await query(
          `INSERT INTO newsletter_subscribers (email, list_name, source)
           VALUES ($1, $2, $3)
           ON CONFLICT (email, list_name) DO UPDATE SET
             status = 'active', updated_at = now()`,
          [body.email, list, body.source || "website"]
        );
      }
      return { success: true };
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: "subscription_failed" });
    }
  });
}
