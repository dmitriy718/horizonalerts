import { FastifyInstance } from "fastify";
import { verifyUnsubscribeToken } from "../services/unsubscribe.js";
import { query } from "../db.js";
import { mergePreferences } from "../services/preference-utils.js";

const CATEGORY_LABELS: Record<string, string> = {
  trading_alerts: "Trading Alerts",
  performance_reports: "Performance Reports",
  marketing: "Marketing & Engagement",
  all: "All Non-Security Emails",
};

export async function unsubscribeRoutes(server: FastifyInstance) {
  /** GET /unsubscribe?token=xxx — Public, no auth. Verifies HMAC, updates prefs, returns HTML. */
  server.get("/unsubscribe", async (req, reply) => {
    const { token } = req.query as { token?: string };

    if (!token) {
      return reply.code(400).type("text/html").send(errorPage("Missing unsubscribe token."));
    }

    const payload = verifyUnsubscribeToken(token);
    if (!payload) {
      return reply.code(400).type("text/html").send(errorPage("This unsubscribe link is invalid or has expired."));
    }

    const { uid, category } = payload;

    // Fetch user preferences
    const rows = await query<{ preferences: any; first_name: string }>(
      "SELECT preferences, first_name FROM users WHERE uid = $1",
      [uid]
    );
    if (!rows.length) {
      return reply.code(404).type("text/html").send(errorPage("User not found."));
    }

    const prefs = mergePreferences(rows[0].preferences);
    const firstName = rows[0].first_name || "there";

    if (category === "all") {
      // Global unsubscribe
      prefs.global_unsubscribe = true;
    } else if (category in prefs.notifications) {
      // Security notifications can never be disabled
      if (category === "account_security") {
        return reply.type("text/html").send(errorPage("Security notifications cannot be disabled."));
      }
      // Disable all email toggles in this category
      const cat = (prefs.notifications as any)[category];
      for (const key of Object.keys(cat)) {
        cat[key].email = false;
      }
    } else {
      return reply.code(400).type("text/html").send(errorPage("Unknown notification category."));
    }

    await query(
      "UPDATE users SET preferences = $1, updated_at = now() WHERE uid = $2",
      [JSON.stringify(prefs), uid]
    );

    const label = CATEGORY_LABELS[category] || category;
    return reply.type("text/html").send(successPage(firstName, label));
  });
}

function successPage(firstName: string, category: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Unsubscribed - Nova by Horizon</title>
  <style>
    body { margin:0; padding:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; color:#e2e8f0; }
    .card { max-width:480px; width:100%; margin:24px; background:#1e293b; border-radius:16px; padding:48px 40px; text-align:center; border:1px solid rgba(255,255,255,0.1); }
    .logo { width:48px; height:48px; background:linear-gradient(135deg,#06b6d4,#4f46e5); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; font-size:20px; font-weight:800; color:#fff; }
    h1 { font-size:20px; margin:0 0 12px; color:#fff; }
    p { font-size:14px; color:#94a3b8; line-height:1.6; margin:0 0 16px; }
    .check { font-size:40px; margin-bottom:16px; }
    a { color:#06b6d4; text-decoration:none; font-weight:600; }
    a:hover { text-decoration:underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">N</div>
    <div class="check">&#10003;</div>
    <h1>You've been unsubscribed</h1>
    <p>Hi ${escapeHtmlSimple(firstName)}, you've been unsubscribed from <strong>${escapeHtmlSimple(category)}</strong> emails.</p>
    <p>You can re-enable notifications anytime in your <a href="https://horizonsvc.com/settings">account settings</a>.</p>
    <p style="font-size:12px;color:#64748b;margin-top:24px;">You will still receive important security alerts related to your account.</p>
  </div>
</body>
</html>`;
}

function errorPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Unsubscribe Error - Nova by Horizon</title>
  <style>
    body { margin:0; padding:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; color:#e2e8f0; }
    .card { max-width:480px; width:100%; margin:24px; background:#1e293b; border-radius:16px; padding:48px 40px; text-align:center; border:1px solid rgba(255,255,255,0.1); }
    .logo { width:48px; height:48px; background:linear-gradient(135deg,#06b6d4,#4f46e5); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; font-size:20px; font-weight:800; color:#fff; }
    h1 { font-size:20px; margin:0 0 12px; color:#fff; }
    p { font-size:14px; color:#94a3b8; line-height:1.6; margin:0 0 16px; }
    a { color:#06b6d4; text-decoration:none; font-weight:600; }
    a:hover { text-decoration:underline; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">N</div>
    <h1>Something went wrong</h1>
    <p>${escapeHtmlSimple(message)}</p>
    <p>If you need help, contact <a href="mailto:support@horizonsvc.com">support@horizonsvc.com</a>.</p>
  </div>
</body>
</html>`;
}

function escapeHtmlSimple(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
