import crypto from "node:crypto";

const SECRET = process.env.JWT_SIGNING_KEY || "dev-secret-change-local-only";
const BASE = process.env.PUBLIC_SITE_URL || "https://horizonsvc.com";

interface UnsubscribePayload {
  uid: string;
  category: string;
  exp: number; // epoch seconds
}

/**
 * Generate a stateless HMAC-signed unsubscribe token.
 * Payload: uid, category, exp (90 days from now).
 */
export function generateUnsubscribeToken(uid: string, category: string): string {
  const payload: UnsubscribePayload = {
    uid,
    category,
    exp: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60, // 90 days
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

/**
 * Verify an unsubscribe token. Returns the payload if valid, null if expired/tampered.
 */
export function verifyUnsubscribeToken(token: string): UnsubscribePayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
  try {
    const sigBuf = Buffer.from(sig, "base64url");
    const expectedBuf = Buffer.from(expected, "base64url");
    // timingSafeEqual throws if buffers differ in length — pre-check
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  } catch {
    return null;
  }

  try {
    const payload: UnsubscribePayload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    );
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Build the full unsubscribe URL for a given user + category.
 */
export function unsubscribeUrl(uid: string, category: string): string {
  const token = generateUnsubscribeToken(uid, category);
  return `${BASE}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}
