import { FastifyInstance } from "fastify";
import { query } from "../db.js";
import { sendEmail } from "../services/email.js";
import { z } from "zod";

const ticketSchema = z.object({
  topic: z.string(),
  subject: z.string(),
  message: z.string(),
  file: z.any().optional() // Handled via multipart usually, but simplifying for JSON payload for now
});

export async function helpRoutes(server: FastifyInstance) {
  
  // Public Contact Form
  server.post("/public/contact", async (req, reply) => {
    const { name, email, subject, message } = req.body as any;
    
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
      to: "dmitriy@horizonsvc.com", // Admin email
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