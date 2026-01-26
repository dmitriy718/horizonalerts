import { FastifyInstance } from "fastify";
import { query } from "../db.js";

export async function entitlementRoutes(server: FastifyInstance) {
  server.get("/entitlement", { preHandler: server.requireAuth }, async (request) => {
    const { uid, email_verified } = request.user;

    if (!email_verified) {
      return {
        plan: "free",
        verifiedEmail: false,
        caps: { alertsPerDay: 5, customization: false }
      };
    }

    const rows = await query<{
      plan: "free" | "pro";
      status: string;
      current_period_end: string | null;
    }>(
      "select plan, status, current_period_end from stripe_entitlements where uid = $1",
      [uid]
    );

    const record = rows[0];
    const isPro = record?.plan === "pro" && record.status === "active";

    return {
      plan: isPro ? "pro" : "free",
      verifiedEmail: true,
      currentPeriodEnd: record?.current_period_end || null,
      caps: {
        alertsPerDay: isPro ? 9999 : 5,
        customization: isPro
      }
    };
  });
}
