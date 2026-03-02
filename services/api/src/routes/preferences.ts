import { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";
import { mergePreferences, DEFAULT_PREFERENCES, SECURITY_KEYS } from "../services/preference-utils.js";

const ChannelSchema = z.object({ email: z.boolean() });

const PreferencesSchema = z.object({
  notifications: z.object({
    account_security: z.object({
      password_changed: ChannelSchema,
      failed_login: ChannelSchema,
      account_locked: ChannelSchema,
      personal_info_changed: ChannelSchema,
    }).optional(),
    trading_alerts: z.object({
      daily_loss_limit: ChannelSchema,
      max_exposure: ChannelSchema,
      risk_of_ruin: ChannelSchema,
      consecutive_losses: ChannelSchema,
      anomaly_circuit_breaker: ChannelSchema,
      macro_event_blackout: ChannelSchema,
      trade_executed: ChannelSchema,
      trade_closed: ChannelSchema,
    }).optional(),
    performance_reports: z.object({
      daily_summary: ChannelSchema,
      weekly_digest: ChannelSchema,
      monthly_report: ChannelSchema,
      milestone_achievements: ChannelSchema,
    }).optional(),
    marketing: z.object({
      newsletter: ChannelSchema,
      feature_announcements: ChannelSchema,
      inactivity_reminders: ChannelSchema,
    }).optional(),
  }).optional(),
  global_unsubscribe: z.boolean().optional(),
  timezone: z.string().optional(),
}).strict();

export async function preferencesRoutes(server: FastifyInstance) {
  /** GET /me/preferences — Returns merged (stored + defaults) preferences */
  server.get("/preferences", { preHandler: [server.requireAuth] }, async (req, reply) => {
    const { uid } = req.user;
    const rows = await query<{ preferences: any }>(
      "SELECT preferences FROM users WHERE uid = $1",
      [uid]
    );
    if (!rows.length) {
      return reply.code(404).send({ error: "user_not_found" });
    }
    return mergePreferences(rows[0].preferences);
  });

  /** PUT /me/preferences — Validates, deep merges into JSONB, returns updated */
  server.put("/preferences", { preHandler: [server.requireAuth] }, async (req, reply) => {
    const { uid } = req.user;

    let body: z.infer<typeof PreferencesSchema>;
    try {
      body = PreferencesSchema.parse(req.body);
    } catch (e: unknown) {
      const details = e instanceof z.ZodError ? e.flatten().fieldErrors : undefined;
      return reply.code(400).send({ error: "invalid_request", ...(details ? { details } : {}) });
    }

    // Enforce: security prefs cannot be disabled
    if (body.notifications?.account_security) {
      for (const [key, val] of Object.entries(body.notifications.account_security)) {
        if (SECURITY_KEYS.has(`account_security.${key}`) && val.email === false) {
          return reply.code(400).send({
            error: "security_prefs_locked",
            message: `Cannot disable security notification: ${key}`,
          });
        }
      }
    }

    // Deep merge: read existing, merge, write back
    const rows = await query<{ preferences: any }>(
      "SELECT preferences FROM users WHERE uid = $1",
      [uid]
    );
    if (!rows.length) {
      return reply.code(404).send({ error: "user_not_found" });
    }

    const existing = mergePreferences(rows[0].preferences);
    const merged = deepMergeUpdate(existing, body);

    await query(
      "UPDATE users SET preferences = $1, updated_at = now() WHERE uid = $2",
      [JSON.stringify(merged), uid]
    );

    return merged;
  });
}

function deepMergeUpdate(target: any, source: any): any {
  if (typeof source !== "object" || source === null) return source ?? target;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] !== undefined) {
      if (typeof target[key] === "object" && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = deepMergeUpdate(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  return result;
}
