import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import jwt from "@fastify/jwt";
import { registerRoutes } from "./routes/index.js";
import { firebaseConfigured, verifyFirebaseToken } from "./auth/firebase.js";

export async function buildServer() {
  const server = Fastify({ logger: true, trustProxy: true });

  const allowedOrigins = (process.env.CORS_ORIGINS || "https://horizonsvc.com,http://localhost:3000").split(",");
  await server.register(cors, {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  });

  await server.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute",
    allowList: ["127.0.0.1"]
  });

  server.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (request: FastifyRequest, body: string | Buffer, done) => {
      const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
      request.rawBody = buffer;
      try {
        const json = JSON.parse(buffer.toString("utf8"));
        done(null, json);
      } catch (error) {
        done(error as Error);
      }
    }
  );

  const jwtSecret = process.env.JWT_SIGNING_KEY;
  if (process.env.NODE_ENV === "production" && (!jwtSecret || jwtSecret === "dev-secret-change")) {
    throw new Error("JWT_SIGNING_KEY must be set to a secure value in production");
  }
  await server.register(jwt, { secret: jwtSecret || "dev-secret-change-local-only" });

  server.decorate(
    "requireAuth",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : "";
      const firebaseEnabled = firebaseConfigured();

      if (firebaseEnabled && token) {
        try {
          const user = await verifyFirebaseToken(token);
          if (user) {
            request.user = user as any;
            return;
          }
        } catch {
          return reply.code(401).send({ error: "unauthorized" });
        }
      }

      try {
        await request.jwtVerify();
      } catch {
        return reply.code(401).send({ error: "unauthorized" });
      }
    }
  );

  await registerRoutes(server);
  return server;
}
