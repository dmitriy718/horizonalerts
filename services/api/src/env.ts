import { z } from "zod";
import fs from "node:fs";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.string().optional(),
  HOST: z.string().optional(),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().optional(),
  JWT_SIGNING_KEY: z.string().min(12),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional()
});

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const isProd = process.env.NODE_ENV === "production";
    if (isProd) {
      throw new Error(`Invalid env: ${parsed.error.message}`);
    }
  }

  if (process.env.NODE_ENV === "production") {
    const explicitPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (explicitPath) {
      if (!fs.existsSync(explicitPath) || !fs.statSync(explicitPath).isFile()) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_PATH");
      }
      return;
    }

    const defaults = [
      "horizonsvcfirebase.json",
      "horizontalv2.json"
    ];
    const found = defaults.some((file) => {
      try {
        return fs.existsSync(file) && fs.statSync(file).isFile();
      } catch {
        return false;
      }
    });
    if (!found) {
      throw new Error("Missing Firebase service account file");
    }
  }
}
