import fs from "node:fs";
import path from "node:path";
import admin from "firebase-admin";

let app: admin.app.App | null = null;

function candidatePaths() {
  const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const defaults = [
    path.join(process.cwd(), "horizonsvcfirebase.json"),
    path.join(process.cwd(), "horizontalv2.json")
  ];
  return envPath ? [envPath, ...defaults] : defaults;
}

function resolveServiceAccount() {
  // Priority 1: Base64 Encoded Environment Variable (Best for Docker/VPS)
  const base64Config = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (base64Config) {
    try {
      const decoded = Buffer.from(base64Config, "base64").toString("utf8");
      return JSON.parse(decoded);
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64", err);
    }
  }

  // Priority 2: File Path
  for (const filePath of candidatePaths()) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const raw = fs.readFileSync(filePath, "utf8");
      return JSON.parse(raw);
    }
  }
  return null;
}

export function firebaseConfigured() {
  return Boolean(resolveServiceAccount());
}

export function getFirebaseApp() {
  if (app) {
    return app;
  }

  const serviceAccount = resolveServiceAccount();
  if (!serviceAccount) {
    return null;
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  return app;
}

export const auth = new Proxy({}, {
  get: (_target, prop) => {
    const app = getFirebaseApp();
    if (!app) throw new Error("Firebase Admin not initialized");
    return (admin.auth() as any)[prop];
  }
}) as admin.auth.Auth;

export async function verifyFirebaseToken(idToken: string) {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) {
    return null;
  }

  const decoded = await admin.auth().verifyIdToken(idToken);
  return {
    uid: decoded.uid,
    email: decoded.email || "",
    email_verified: Boolean(decoded.email_verified)
  };
}
