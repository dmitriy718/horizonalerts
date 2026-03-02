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
import { botRoutes } from "./bot.js";
import { preferencesRoutes } from "./preferences.js";
import { profileRoutes } from "./profile.js";
import { supportRoutes } from "./support.js";
import { unsubscribeRoutes } from "./unsubscribe.js";
import { newsletterRoutes } from "./newsletter.js";

export async function registerRoutes(server: FastifyInstance) {
  await server.register(healthRoutes, { prefix: "/health" });

  await server.register(publicFeedRoutes, { prefix: "/public-feed" });
  await server.register(entitlementRoutes, { prefix: "/me" });
  await server.register(preferencesRoutes, { prefix: "/me" });
  await server.register(profileRoutes, { prefix: "/me" });
  await server.register(supportRoutes, { prefix: "/me" });
  await server.register(scannerRoutes, { prefix: "/scanner" });
  await server.register(helpRoutes, { prefix: "/help" });
  await server.register(portfolioRoutes, { prefix: "/portfolio" });
  await server.register(stripeRoutes, { prefix: "/auth" }); // /auth/callback/stripe
  await server.register(authRoutes, { prefix: "/auth" }); // /auth/register
  await server.register(billingRoutes, { prefix: "/billing" });
  await server.register(botRoutes, { prefix: "/bot" });
  await server.register(unsubscribeRoutes, { prefix: "/" }); // /unsubscribe (public)
  await server.register(newsletterRoutes, { prefix: "/newsletter" }); // /newsletter/subscribe (public)
}
