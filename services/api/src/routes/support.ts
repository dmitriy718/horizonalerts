import { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";

const CreateTicketSchema = z.object({
  department: z.enum(["billing", "tech_support", "customer_service", "referrals", "partnership"]),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

const ReplySchema = z.object({
  message: z.string().min(1).max(5000),
});

export async function supportRoutes(server: FastifyInstance) {
  /** GET /me/tickets — List user's tickets */
  server.get("/tickets", { preHandler: [server.requireAuth] }, async (req) => {
    const { uid } = req.user;
    const rows = await query<{
      id: number; department: string; subject: string; status: string;
      priority: string; created_at: string; updated_at: string;
      reply_count: string;
    }>(
      `SELECT t.*, COALESCE(rc.cnt, 0) AS reply_count
       FROM support_tickets t
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS cnt FROM ticket_replies WHERE ticket_id = t.id
       ) rc ON true
       WHERE t.uid = $1
       ORDER BY t.created_at DESC
       LIMIT 50`,
      [uid]
    );
    return rows.map((r) => ({
      id: r.id,
      department: r.department,
      subject: r.subject,
      status: r.status,
      priority: r.priority,
      replyCount: Number(r.reply_count),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  });

  /** GET /me/tickets/:id — Get ticket with replies */
  server.get("/tickets/:id", { preHandler: [server.requireAuth] }, async (req, reply) => {
    const { uid } = req.user;
    const { id } = req.params as { id: string };
    if (!/^\d+$/.test(id)) {
      return reply.code(400).send({ error: "invalid_ticket_id" });
    }

    const tickets = await query<{
      id: number; department: string; subject: string; message: string;
      status: string; priority: string; created_at: string; updated_at: string;
    }>(
      "SELECT * FROM support_tickets WHERE id = $1 AND uid = $2",
      [id, uid]
    );
    if (!tickets.length) {
      return reply.code(404).send({ error: "ticket_not_found" });
    }

    const replies = await query<{
      id: number; author_type: string; author_name: string; message: string; created_at: string;
    }>(
      "SELECT * FROM ticket_replies WHERE ticket_id = $1 ORDER BY created_at ASC",
      [id]
    );

    const t = tickets[0];
    return {
      id: t.id,
      department: t.department,
      subject: t.subject,
      message: t.message,
      status: t.status,
      priority: t.priority,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      replies: replies.map((r) => ({
        id: r.id,
        authorType: r.author_type,
        authorName: r.author_name,
        message: r.message,
        createdAt: r.created_at,
      })),
    };
  });

  /** POST /me/tickets — Create a new ticket */
  server.post("/tickets", { preHandler: [server.requireAuth] }, async (req, reply) => {
    const { uid } = req.user;
    let body;
    try {
      body = CreateTicketSchema.parse(req.body);
    } catch (e: unknown) {
      const details = e instanceof z.ZodError ? e.flatten().fieldErrors : undefined;
      return reply.code(400).send({ error: "invalid_request", ...(details ? { details } : {}) });
    }

    const rows = await query<{ id: number }>(
      `INSERT INTO support_tickets (uid, department, subject, message, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [uid, body.department, body.subject, body.message, body.priority]
    );

    return { success: true, ticketId: rows[0].id };
  });

  /** POST /me/tickets/:id/reply — Add a reply to a ticket */
  server.post("/tickets/:id/reply", { preHandler: [server.requireAuth] }, async (req, reply) => {
    const { uid } = req.user;
    const { id } = req.params as { id: string };
    if (!/^\d+$/.test(id)) {
      return reply.code(400).send({ error: "invalid_ticket_id" });
    }

    // Verify ticket belongs to user
    const tickets = await query<{ id: number; status: string }>(
      "SELECT id, status FROM support_tickets WHERE id = $1 AND uid = $2",
      [id, uid]
    );
    if (!tickets.length) {
      return reply.code(404).send({ error: "ticket_not_found" });
    }
    if (tickets[0].status === "closed") {
      return reply.code(400).send({ error: "ticket_closed" });
    }

    let body;
    try {
      body = ReplySchema.parse(req.body);
    } catch (e: unknown) {
      const details = e instanceof z.ZodError ? e.flatten().fieldErrors : undefined;
      return reply.code(400).send({ error: "invalid_request", ...(details ? { details } : {}) });
    }

    // Get user name
    const users = await query<{ first_name: string }>(
      "SELECT first_name FROM users WHERE uid = $1",
      [uid]
    );
    const authorName = users[0]?.first_name || "User";

    await query(
      `INSERT INTO ticket_replies (ticket_id, author_type, author_name, message)
       VALUES ($1, 'user', $2, $3)`,
      [id, authorName, body.message]
    );

    // Update ticket timestamp
    await query(
      "UPDATE support_tickets SET updated_at = now() WHERE id = $1",
      [id]
    );

    return { success: true };
  });
}
