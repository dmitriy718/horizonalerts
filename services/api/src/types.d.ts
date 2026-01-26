import "@fastify/jwt";
import "fastify";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      uid: string;
      email: string;
      email_verified: boolean;
      plan?: "free" | "pro";
    };
    user: {
      uid: string;
      email: string;
      email_verified: boolean;
      plan?: "free" | "pro";
    };
  }
}

declare module "fastify" {
  interface FastifyRequest {
    rawBody?: Buffer;
  }

  interface FastifyInstance {
    requireAuth: any;
  }
}
