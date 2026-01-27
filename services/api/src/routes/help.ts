import { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { configureSendgrid, sendEmail, sendgridConfigured } from "../notifications/sendgrid.js";

const ticketSchema = z.object({
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(2000)
});

export async function helpRoutes(server: FastifyInstance) {
  configureSendgrid();
  server.post("/ticket", { preHandler: server.requireAuth }, async (request, reply) => {
    const parse = ticketSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const { uid, email } = request.user;
    const { subject, message } = parse.data;

    const rows = await query<{ id: number }>(
      `insert into help_tickets (uid, subject, message, status, created_at, email)
       values ($1, $2, $3, 'open', now(), $4)
       returning id`,
      [uid, subject, message, email]
    );

    const ticketId = rows[0]?.id;
    if (sendgridConfigured() && ticketId) {
      const userHtml = `<p>We received your ticket.</p><p>Ticket ID: ${ticketId}</p>`;
      await sendEmail(email, "Support ticket received", userHtml);

      const supportEmail = process.env.SUPPORT_EMAIL || "support@horizonsvc.com";
      const staffHtml = `<p>New ticket from ${email}</p><p>${message}</p>`;
      await sendEmail(supportEmail, `New ticket: ${subject}`, staffHtml);

      await query(
        `insert into email_log (uid, template, subject, sent_at, to_addr)
         values ($1, $2, $3, now(), $4)`,
        [uid, "help_ticket_user", "Support ticket received", email]
      );
      await query(
        `insert into email_log (uid, template, subject, sent_at, to_addr)
         values ($1, $2, $3, now(), $4)`,
        [uid, "help_ticket_staff", `New ticket: ${subject}`, supportEmail]
      );
    }

    return { ok: true };
  });
}
