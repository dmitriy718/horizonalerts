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

function resolveServiceAccountPath() {
  for (const filePath of candidatePaths()) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return filePath;
    }
  }
  return null;
}

export function firebaseConfigured() {
  return Boolean(resolveServiceAccountPath());
}

export function getFirebaseApp() {
  if (app) {
    return app;
  }

  const filePath = resolveServiceAccountPath();
  if (!filePath) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const serviceAccount = JSON.parse(raw);

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  return app;
}

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
