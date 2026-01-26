import Fastify, { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import jwt from "@fastify/jwt";
import { registerRoutes } from "./routes/index.js";

export async function buildServer() {
  const server = Fastify({ logger: true });

  await server.register(cors, {
    origin: true,
    credentials: true
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

  const jwtSecret = process.env.JWT_SIGNING_KEY || "dev-secret-change";
  await server.register(jwt, { secret: jwtSecret });

  server.decorate(
    "requireAuth",
    async (request: FastifyRequest, reply: FastifyReply) => {
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
