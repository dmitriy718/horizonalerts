import { FastifyInstance } from "fastify";
import Stripe from "stripe";
import { query } from "../db.js";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

const stripe = new Stripe(stripeSecret, { apiVersion: "2024-04-10" });

export async function stripeRoutes(server: FastifyInstance) {
  server.post(
    "/callback/stripe",
    { config: { rawBody: true } },
    async (request, reply) => {
    const signature = request.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      return reply.code(400).send({ error: "missing_signature" });
    }

    let event: Stripe.Event;
    try {
      const rawBody = request.rawBody as Buffer | undefined;
      if (!rawBody) {
        return reply.code(400).send({ error: "missing_raw_body" });
      }
      event = stripe.webhooks.constructEvent(
        rawBody.toString("utf8"),
        signature,
        webhookSecret
      );
    } catch (error) {
      server.log.warn({ error }, "stripe signature failed");
      return reply.code(400).send({ error: "invalid_signature" });
    }

    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const uid = subscription.metadata?.uid;
      const plan = subscription.items.data[0]?.price?.metadata?.plan || "pro";
      if (uid) {
        await query(
          `insert into stripe_entitlements (uid, plan, status, current_period_end, updated_at)
           values ($1, $2, $3, to_timestamp($4), now())
           on conflict (uid) do update
           set plan = excluded.plan,
               status = excluded.status,
               current_period_end = excluded.current_period_end,
               updated_at = now()`,
          [uid, plan, subscription.status, subscription.current_period_end]
        );
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const uid = subscription.metadata?.uid;
      if (uid) {
        await query(
          `update stripe_entitlements
           set status = 'canceled', updated_at = now()
           where uid = $1`,
          [uid]
        );
      }
    }

    return { received: true };
  });
}
