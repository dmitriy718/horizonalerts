import { FastifyInstance } from "fastify";
import { query } from "../db.js";
import { sendEmail } from "../services/email.js";
import { z } from "zod";

const ticketSchema = z.object({
  topic: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  file: z.any().optional()
});

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

// Simple in-memory rate limiter for contact form (per IP, 5 per hour)
const contactRateMap = new Map<string, number[]>();
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (contactRateMap.get(ip) || []).filter(t => now - t < RATE_WINDOW);
  if (timestamps.length >= RATE_MAX) return true;
  timestamps.push(now);
  contactRateMap.set(ip, timestamps);
  return false;
}

// Cleanup stale entries every 10 minutes to prevent memory leak
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW;
  for (const [ip, times] of contactRateMap) {
    const filtered = times.filter(t => t > cutoff);
    if (filtered.length === 0) contactRateMap.delete(ip);
    else contactRateMap.set(ip, filtered);
  }
}, 10 * 60 * 1000).unref();

export async function helpRoutes(server: FastifyInstance) {

  // Public Contact Form
  server.post("/public/contact", async (req, reply) => {
    const ip = req.ip;
    if (isRateLimited(ip)) {
      return reply.code(429).send({ error: "Too many requests. Please try again later." });
    }

    const parse = contactSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.code(400).send({ error: "invalid_request", details: parse.error.flatten() });
    }

    const { name, email, subject, message } = parse.data;

    try {
      // Send Confirmation to User
      await sendEmail({
        to: email,
        type: "support",
        subject: `Received: ${subject}`,
        template: "contact",
        data: { name, message }
      });

      // Notify Admin (escape user content for HTML safety)
      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      await sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL || "support@horizonsvc.com",
        type: "support",
        subject: `[Contact Form] ${subject}`,
        html: `From: ${esc(name)} (${esc(email)})<br/>Message: ${esc(message)}`
      });
    } catch (err) {
      req.log.error(err, "contact email failed");
    }

    return { success: true };
  });

  // Auth-only Ticket System
  server.post("/ticket", { preHandler: server.requireAuth }, async (req, reply) => {
    const { uid, email } = req.user;
    const ticketParse = ticketSchema.safeParse(req.body);
    if (!ticketParse.success) {
      return reply.code(400).send({ error: "invalid_request", details: ticketParse.error.flatten() });
    }
    const body = ticketParse.data;

    // Save to DB
    const res = await query(
      `INSERT INTO help_tickets (uid, email, subject, message, status)
       VALUES ($1, $2, $3, $4, 'open') RETURNING id`,
      [uid, email, `[${body.topic}] ${body.subject}`, body.message]
    );
    const ticketId = res[0].id;

    // Email Confirmation
    await sendEmail({
      to: email,
      type: "support",
      subject: `Support Request #${ticketId}`,
      template: "ticket",
      data: { ticketId, topic: body.topic, message: body.message }
    });

    return { success: true, ticketId };
  });
}