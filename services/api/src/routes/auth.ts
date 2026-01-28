import { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { sendEmail } from "../services/email.js";
import { auth as adminAuth } from "../auth/firebase.js";

const RegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  age: z.coerce.number().min(18), // Use coerce to handle string->number from JSON
  zipCode: z.string().min(5),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  email: z.string().email(),
  preferences: z.record(z.any()).optional(),
});

export async function authRoutes(server: FastifyInstance) {
  server.post("/register", { preHandler: [server.requireAuth] }, async (req, reply) => {
    const user = (req as any).user; 
    
    // Parse body
    let body;
    try {
      body = RegisterSchema.parse(req.body);
    } catch (e) {
      return reply.code(400).send({ error: "Validation failed", details: e });
    }

    // Security check: Ensure token email matches body email (optional but good)
    if (user.email && user.email !== body.email) {
      return reply.code(403).send({ error: "Email mismatch" });
    }

    try {
      // 1. Save to DB
      await query(
        `INSERT INTO users (uid, email, first_name, last_name, age, zip_code, street_address, city, state, preferences)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (uid) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         age = EXCLUDED.age,
         zip_code = EXCLUDED.zip_code,
         street_address = EXCLUDED.street_address,
         city = EXCLUDED.city,
         state = EXCLUDED.state,
         preferences = COALESCE(users.preferences, '{}'::jsonb) || EXCLUDED.preferences,
         updated_at = now()`,
        [user.uid, body.email, body.firstName, body.lastName, body.age, body.zipCode, body.streetAddress || null, body.city || null, body.state || null, JSON.stringify(body.preferences || {})]
      );

      // 2. Generate Custom Verification Link
      const link = await adminAuth.generateEmailVerificationLink(body.email);

      // 3. Send Email via SMTP
      await sendEmail({
        to: body.email,
        type: "support",
        subject: "Verify your Horizon Alerts account",
        template: "verify",
        data: { url: link }
      });

      // 4. Send Welcome Email (Wait, usually welcome is AFTER verify? 
      // But user requested "sign up email, verify email email...". 
      // The Verify email IS the sign up email essentially. 
      // Once verified, we should send Welcome. 
      // We can hook into a webhook or just rely on the user logging in next time?
      // For now, let's just send Verify.)

      return { success: true };
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: "Registration failed", details: String(err) });
    }
  });
}
