import { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { sendEmail } from "../services/email.js";

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

export async function profileRoutes(server: FastifyInstance) {
  /** GET /me/profile — Fetch user profile */
  server.get("/profile", { preHandler: [server.requireAuth] }, async (req, reply) => {
    const { uid } = req.user;
    const rows = await query<{
      uid: string; email: string; first_name: string; last_name: string;
      age: number; zip_code: string; is_premium: boolean; created_at: string;
    }>(
      "SELECT uid, email, first_name, last_name, age, zip_code, is_premium, created_at FROM users WHERE uid = $1",
      [uid]
    );
    if (!rows.length) {
      return reply.code(404).send({ error: "user_not_found" });
    }
    const u = rows[0];
    return {
      uid: u.uid,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      age: u.age,
      zipCode: u.zip_code,
      isPremium: u.is_premium,
      createdAt: u.created_at,
    };
  });

  /** PUT /me/profile — Update display name (first/last) */
  server.put("/profile", { preHandler: [server.requireAuth] }, async (req, reply) => {
    const { uid } = req.user;
    let body;
    try {
      body = UpdateProfileSchema.parse(req.body);
    } catch (e: unknown) {
      const details = e instanceof z.ZodError ? e.flatten().fieldErrors : undefined;
      return reply.code(400).send({ error: "invalid_request", ...(details ? { details } : {}) });
    }

    if (!body.firstName && !body.lastName) {
      return reply.code(400).send({ error: "nothing_to_update" });
    }

    const sets: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (body.firstName) {
      sets.push(`first_name = $${idx++}`);
      params.push(body.firstName);
    }
    if (body.lastName) {
      sets.push(`last_name = $${idx++}`);
      params.push(body.lastName);
    }
    sets.push("updated_at = now()");
    params.push(uid);

    // Use RETURNING to get updated data in a single query (was 3 round-trips)
    const updated = await query<{ first_name: string; last_name: string; email: string }>(
      `UPDATE users SET ${sets.join(", ")} WHERE uid = $${idx} RETURNING first_name, last_name, email`,
      params
    );
    if (!updated.length) {
      return reply.code(404).send({ error: "user_not_found" });
    }

    // Send personalInfoChanged email
    const changedFields: string[] = [];
    if (body.firstName) changedFields.push("First Name");
    if (body.lastName) changedFields.push("Last Name");

    await sendEmail({
      to: updated[0].email,
      type: "security",
      subject: "Your Profile Was Updated",
      template: "personalInfoChanged",
      data: {
        firstName: updated[0].first_name || "there",
        changedFields,
        ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown",
        timestamp: new Date().toISOString(),
      },
      userId: uid,
      skipPreferenceCheck: true,
    });

    return {
      firstName: updated[0].first_name || "",
      lastName: updated[0].last_name || "",
      email: updated[0].email || "",
    };
  });
}
