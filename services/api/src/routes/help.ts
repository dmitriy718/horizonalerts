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
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 60 * 60 * 1000; // 1 hour
  const maxRequests = 5;
  const timestamps = (contactRateMap.get(ip) || []).filter(t => now - t < window);
  if (timestamps.length >= maxRequests) return true;
  timestamps.push(now);
  contactRateMap.set(ip, timestamps);
  return false;
}

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

    // Send Confirmation to User
    await sendEmail({
      to: email,
      type: "support",
      subject: `Received: ${subject}`,
      template: "contact",
      data: { name, message }
    });

    // Notify Admin
    await sendEmail({
      to: "dmitriy@horizonsvc.com",
      type: "support",
      subject: `[Contact Form] ${subject}`,
      html: `From: ${name} (${email})<br/>Message: ${message}`
    });

    return { success: true };
  });

  // Auth-only Ticket System
  server.post("/ticket", { preHandler: server.requireAuth }, async (req, reply) => {
    const { uid, email } = req.user;
    const body = ticketSchema.parse(req.body);

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