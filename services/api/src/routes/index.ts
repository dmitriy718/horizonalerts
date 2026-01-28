import { FastifyInstance } from "fastify";
import { publicFeedRoutes } from "./publicFeed.js";
import { entitlementRoutes } from "./entitlements.js";
import { scannerRoutes } from "./scanner.js";
import { helpRoutes } from "./help.js";
import { portfolioRoutes } from "./portfolio.js";
import { stripeRoutes } from "./stripe.js";
import { healthRoutes } from "./health.js";
import { billingRoutes } from "./billing.js";
import { authRoutes } from "./auth.js";

export async function registerRoutes(server: FastifyInstance) {
  await server.register(healthRoutes, { prefix: "/health" });

  await server.register(publicFeedRoutes, { prefix: "/public-feed" });
  await server.register(entitlementRoutes, { prefix: "/me" });
  await server.register(scannerRoutes, { prefix: "/scanner" });
  await server.register(helpRoutes, { prefix: "/help" });
  await server.register(portfolioRoutes, { prefix: "/portfolio" });
  await server.register(stripeRoutes, { prefix: "/auth" }); // /auth/callback/stripe
  await server.register(authRoutes, { prefix: "/auth" }); // /auth/register
  await server.register(billingRoutes, { prefix: "/billing" });
}
