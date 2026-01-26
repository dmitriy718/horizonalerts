import { FastifyInstance } from "fastify";
import { z } from "zod";

const runSchema = z.object({
  classScope: z.enum(["day", "swing", "invest"]),
  markets: z.array(z.enum(["us", "ca", "crypto"])).default(["us", "ca"])
});

export async function scannerRoutes(server: FastifyInstance) {
  server.post("/run", { preHandler: server.requireAuth }, async (request, reply) => {
    const parse = runSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.code(400).send({ error: "invalid_request" });
    }

    const { classScope, markets } = parse.data;
    const { email_verified } = request.user;

    if (!email_verified) {
      return reply.code(403).send({ error: "email_unverified" });
    }

    return {
      accepted: true,
      classScope,
      markets,
      message: "scan queued"
    };
  });
}
