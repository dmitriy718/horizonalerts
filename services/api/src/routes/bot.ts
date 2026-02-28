import { FastifyInstance } from "fastify";
import { z } from "zod";
import { query } from "../db.js";

function isAllowedBotUrl(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl);
    const hostname = u.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return false;
    if (hostname.startsWith("169.254.")) return false;
    if (hostname.startsWith("10.")) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return false;
    if (hostname.startsWith("192.168.")) return false;
    return true;
  } catch { return false; }
}

const upsertSchema = z.object({
  bot_url: z.string().url(),
  api_key: z.string().min(1),
  hosting_type: z.enum(["managed", "self-hosted"]).default("self-hosted"),
  label: z.string().max(100).default("My Bot"),
});

interface BotConnection {
  id: number;
  uid: string;
  bot_url: string;
  api_key: string;
  hosting_type: string;
  label: string;
  status: string;
  created_at: string;
  updated_at: string;
}

async function getBotConnection(uid: string): Promise<BotConnection | null> {
  const rows = await query<BotConnection>(
    `SELECT * FROM bot_connections WHERE uid = $1 AND status = 'active' LIMIT 1`,
    [uid]
  );
  return rows[0] || null;
}

async function proxyToBot(
  botUrl: string,
  apiKey: string,
  path: string,
  queryString?: string
): Promise<{ status: number; data: unknown }> {
  const url = queryString
    ? `${botUrl}${path}?${queryString}`
    : `${botUrl}${path}`;

  const res = await fetch(url, {
    headers: { "X-API-Key": apiKey, Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

export async function botRoutes(server: FastifyInstance) {
  // --- Proxy endpoints ---

  const proxyEndpoints: { route: string; botPath: string }[] = [
    { route: "/status", botPath: "/api/v1/status" },
    { route: "/performance", botPath: "/api/v1/performance" },
    { route: "/positions", botPath: "/api/v1/positions" },
    { route: "/trades", botPath: "/api/v1/trades" },
    { route: "/strategies", botPath: "/api/v1/strategy-performance" },
    { route: "/risk", botPath: "/api/v1/risk" },
    { route: "/thoughts", botPath: "/api/v1/thoughts" },
  ];

  for (const ep of proxyEndpoints) {
    server.get(
      ep.route,
      { preHandler: server.requireAuth },
      async (request, reply) => {
        const { uid } = request.user;
        const conn = await getBotConnection(uid);
        if (!conn) {
          return reply.code(404).send({ error: "no_bot_connected" });
        }

        try {
          const qs =
            typeof (request.query as Record<string, string>) === "object"
              ? new URLSearchParams(
                  request.query as Record<string, string>
                ).toString()
              : "";
          const result = await proxyToBot(
            conn.bot_url,
            conn.api_key,
            ep.botPath,
            qs || undefined
          );
          return reply.code(result.status).send(result.data);
        } catch (err) {
          request.log.error({ err, route: ep.route }, "bot proxy error");
          return reply.code(502).send({ error: "bot_unreachable" });
        }
      }
    );
  }

  // --- Connection management ---

  server.get(
    "/connection",
    { preHandler: server.requireAuth },
    async (request, reply) => {
      const { uid } = request.user;
      const conn = await getBotConnection(uid);
      if (!conn) {
        return reply.code(404).send({ error: "no_bot_connected" });
      }

      return {
        id: conn.id,
        bot_url: conn.bot_url,
        hosting_type: conn.hosting_type,
        label: conn.label,
        status: conn.status,
        created_at: conn.created_at,
        updated_at: conn.updated_at,
      };
    }
  );

  server.put(
    "/connection",
    { preHandler: server.requireAuth },
    async (request, reply) => {
      const parse = upsertSchema.safeParse(request.body);
      if (!parse.success) {
        return reply
          .code(400)
          .send({ error: "invalid_request", details: parse.error.flatten() });
      }

      const { bot_url, api_key, hosting_type, label } = parse.data;
      const { uid } = request.user;

      // SSRF protection — block private network addresses
      if (!isAllowedBotUrl(bot_url)) {
        return reply.code(422).send({
          error: "invalid_bot_url",
          message: "Bot URL cannot point to internal network addresses",
        });
      }

      // Validate the connection by hitting the bot's status endpoint
      try {
        const check = await proxyToBot(bot_url, api_key, "/api/v1/status");
        if (check.status !== 200) {
          return reply.code(422).send({
            error: "bot_connection_failed",
            message: `Bot returned status ${check.status}`,
          });
        }
      } catch {
        return reply.code(422).send({
          error: "bot_unreachable",
          message: "Could not reach bot at the provided URL",
        });
      }

      // Upsert
      const rows = await query<BotConnection>(
        `INSERT INTO bot_connections (uid, bot_url, api_key, hosting_type, label, updated_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (uid)
         DO UPDATE SET bot_url = $2, api_key = $3, hosting_type = $4, label = $5, status = 'active', updated_at = now()
         RETURNING *`,
        [uid, bot_url, api_key, hosting_type, label]
      );

      return {
        ok: true,
        connection: {
          id: rows[0].id,
          bot_url: rows[0].bot_url,
          hosting_type: rows[0].hosting_type,
          label: rows[0].label,
          status: rows[0].status,
        },
      };
    }
  );

  server.delete(
    "/connection",
    { preHandler: server.requireAuth },
    async (request, reply) => {
      const { uid } = request.user;
      await query(
        `UPDATE bot_connections SET status = 'disconnected', updated_at = now() WHERE uid = $1`,
        [uid]
      );
      return { ok: true };
    }
  );
}
