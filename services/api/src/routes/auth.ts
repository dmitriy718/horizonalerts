import { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { sendEmail } from "../services/email.js";
import { getAdminAuth } from "../auth/firebase.js";

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

const LoginAttemptSchema = z.object({
  email: z.string().email(),
  success: z.boolean(),
});

export async function authRoutes(server: FastifyInstance) {
  server.post("/register", { preHandler: [server.requireAuth] }, async (req, reply) => {
    const { uid, email: tokenEmail } = req.user;

    // Parse body
    let body;
    try {
      body = RegisterSchema.parse(req.body);
    } catch (e: unknown) {
      const details = e instanceof z.ZodError ? e.flatten().fieldErrors : undefined;
      return reply.code(400).send({ error: "invalid_request", ...(details ? { details } : {}) });
    }

    // Security check: Ensure token email matches body email (case-insensitive)
    if (tokenEmail && tokenEmail.toLowerCase() !== body.email.toLowerCase()) {
      return reply.code(403).send({ error: "email_mismatch" });
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
        [uid, body.email, body.firstName, body.lastName, body.age, body.zipCode, body.streetAddress || null, body.city || null, body.state || null, JSON.stringify(body.preferences || {})]
      );

      // 2. Generate Custom Verification Link
      const link = await getAdminAuth().generateEmailVerificationLink(body.email);

      // 3. Send Email via SMTP
      await sendEmail({
        to: body.email,
        type: "support",
        subject: "Verify your Nova by Horizon account",
        template: "verify",
        data: { url: link },
        userId: uid,
        skipPreferenceCheck: true,
      });

      return { success: true };
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: "Registration failed" });
    }
  });

  /** POST /auth/login-attempt — Track failed/successful login attempts */
  server.post("/login-attempt", { preHandler: [server.rateLimit({ max: 5, timeWindow: '15 minutes' })] }, async (req, reply) => {
    let body;
    try {
      body = LoginAttemptSchema.parse(req.body);
    } catch (e: unknown) {
      const details = e instanceof z.ZodError ? e.flatten().fieldErrors : undefined;
      return reply.code(400).send({ error: "invalid_request", ...(details ? { details } : {}) });
    }

    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req.ip
      || "unknown";
    const userAgent = req.headers["user-agent"] || "";
    const now = new Date().toISOString();

    // Log attempt
    await query(
      `INSERT INTO login_attempts (email, ip_address, user_agent, success)
       VALUES ($1, $2, $3, $4)`,
      [body.email, ipAddress, userAgent, body.success]
    );

    if (body.success) {
      // Reset failed count on successful login
      await query(
        `UPDATE users SET failed_login_count = 0, locked_until = NULL, updated_at = now()
         WHERE LOWER(email) = LOWER($1)`,
        [body.email]
      );
      return { status: "ok" };
    }

    // Count recent failures (last 30 min)
    const recentFailures = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM login_attempts
       WHERE LOWER(email) = LOWER($1) AND success = false
       AND created_at > now() - interval '30 minutes'`,
      [body.email]
    );
    const failCount = parseInt(recentFailures[0]?.count || "0", 10);

    // Get user info for sending emails
    const users = await query<{ uid: string; first_name: string; email: string }>(
      `SELECT uid, first_name, email FROM users WHERE LOWER(email) = LOWER($1)`,
      [body.email]
    );

    if (!users.length) {
      // Don't reveal whether the user exists
      return { status: "ok" };
    }

    const user = users[0];

    // Update failed count
    await query(
      `UPDATE users SET failed_login_count = $1, updated_at = now() WHERE uid = $2`,
      [failCount, user.uid]
    );

    // At 2 failures: send warning email
    if (failCount === 2) {
      await sendEmail({
        to: user.email,
        type: "security",
        subject: "Failed Login Attempts on Your Account",
        template: "failedLogin",
        data: {
          firstName: user.first_name || "there",
          attemptCount: failCount,
          ipAddress,
          timestamp: now,
        },
        userId: user.uid,
        skipPreferenceCheck: true,
      });
    }

    // At 3+ failures: lock account
    if (failCount >= 3) {
      const lockUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
      await query(
        `UPDATE users SET locked_until = $1, updated_at = now() WHERE uid = $2`,
        [lockUntil, user.uid]
      );

      await sendEmail({
        to: user.email,
        type: "security",
        subject: "Your Account Has Been Temporarily Locked",
        template: "accountLocked",
        data: {
          firstName: user.first_name || "there",
          ipAddress,
          timestamp: now,
        },
        userId: user.uid,
        skipPreferenceCheck: true,
      });

      return { status: "locked", locked_until: lockUntil };
    }

    return { status: "ok" };
  });

  /** GET /auth/lock-status?email=xxx — Check if account is locked (public) */
  server.get("/lock-status", { preHandler: [server.rateLimit({ max: 10, timeWindow: '1 minute' })] }, async (req, reply) => {
    const { email } = req.query as { email?: string };
    if (!email) {
      return reply.code(400).send({ error: "email_required" });
    }

    const rows = await query<{ locked_until: string | null }>(
      `SELECT locked_until FROM users WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    if (!rows.length || !rows[0].locked_until) {
      return { locked: false };
    }

    const lockUntil = new Date(rows[0].locked_until);
    if (lockUntil <= new Date()) {
      // Lock expired — report as unlocked but do NOT modify DB from a public endpoint
      return { locked: false };
    }

    return {
      locked: true,
      locked_until: rows[0].locked_until,
      minutes_remaining: Math.ceil((lockUntil.getTime() - Date.now()) / 60000),
    };
  });

  /** POST /auth/welcome — Send welcome email after verification (called by client) */
  server.post("/welcome", { preHandler: [server.requireAuth] }, async (req, reply) => {
    const { uid } = req.user;
    const users = await query<{ email: string; first_name: string }>(
      "SELECT email, first_name FROM users WHERE uid = $1",
      [uid]
    );
    if (!users.length) {
      return reply.code(404).send({ error: "user_not_found" });
    }

    await sendEmail({
      to: users[0].email,
      type: "support",
      subject: "Welcome to Nova by Horizon",
      template: "welcome",
      data: { firstName: users[0].first_name || "there" },
      userId: uid,
      skipPreferenceCheck: true,
    });

    return { success: true };
  });
}
