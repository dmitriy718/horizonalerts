import { FastifyInstance } from "fastify";
import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripe = new Stripe(stripeSecret, { apiVersion: "2024-04-10" });

const priceId = process.env.STRIPE_PRICE_ID_PRO || "";
const siteUrl = process.env.PUBLIC_SITE_URL || "https://horizonsvc.com";
const successUrl =
  process.env.STRIPE_SUCCESS_URL || `${siteUrl}/pricing?status=success`;
const cancelUrl =
  process.env.STRIPE_CANCEL_URL || `${siteUrl}/pricing?status=cancel`;
const portalReturnUrl =
  process.env.STRIPE_PORTAL_RETURN_URL || `${siteUrl}/settings`;

export async function billingRoutes(server: FastifyInstance) {
  server.post(
    "/checkout-session",
    { preHandler: server.requireAuth },
    async (request, reply) => {
      if (!stripeSecret || !priceId) {
        return reply.code(500).send({ error: "stripe_not_configured" });
      }

      const { uid, email } = request.user;
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: email,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { uid }
      });

      return { url: session.url };
    }
  );

  server.post(
    "/portal-session",
    { preHandler: server.requireAuth },
    async (request, reply) => {
      if (!stripeSecret) {
        return reply.code(500).send({ error: "stripe_not_configured" });
      }

      const { uid, email } = request.user;
      const customers = await stripe.customers.list({ email, limit: 1 });
      let customerId = customers.data[0]?.id;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email,
          metadata: { uid }
        });
        customerId = customer.id;
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: portalReturnUrl
      });

      return { url: session.url };
    }
  );
}
