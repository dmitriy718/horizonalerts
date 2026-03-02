import nodemailer from "nodemailer";
import {
  verifyEmail,
  welcomeEmail,
  passwordChanged,
  failedLoginWarning,
  accountLocked,
  personalInfoChanged,
  accountDeactivated,
  botSetupStarted,
  botSetupComplete,
  dailyLossAlert,
  maxExposureAlert,
  riskOfRuinAlert,
  consecutiveLossAlert,
  anomalyAlert,
  macroEventAlert,
  dailySummary,
  weeklyDigest,
  monthlyReport,
  tradeExecuted,
  tradeClosed,
  milestoneAchieved,
  newsletter,
  featureAnnouncement,
  inactivityReengagement,
  escapeHtml,
} from "./email-templates/index.js";
import { unsubscribeUrl } from "./unsubscribe.js";
import { mergePreferences, isPreferenceEnabled, SECURITY_KEYS } from "./preference-utils.js";
import { query } from "../db.js";

type EmailType = "support" | "alerts" | "marketing" | "security";

type TemplateName =
  | "verify"
  | "welcome"
  | "contact"
  | "ticket"
  | "security"
  | "passwordChanged"
  | "failedLogin"
  | "accountLocked"
  | "personalInfoChanged"
  | "accountDeactivated"
  | "botSetupStarted"
  | "botSetupComplete"
  | "dailyLoss"
  | "maxExposure"
  | "riskOfRuin"
  | "consecutiveLoss"
  | "anomaly"
  | "macroEvent"
  | "dailySummary"
  | "weeklyDigest"
  | "monthlyReport"
  | "tradeExecuted"
  | "tradeClosed"
  | "milestone"
  | "newsletter"
  | "featureAnnouncement"
  | "inactivity";

interface SendOptions {
  to: string;
  type: EmailType;
  subject: string;
  html?: string;
  template?: TemplateName;
  data?: any;
  attachments?: any[];
  /** User ID — required for preference checking + unsubscribe links */
  userId?: string;
  /** Preference key, e.g. "trading_alerts.daily_loss_limit" */
  preferenceKey?: string;
  /** Skip preference check (used for security emails) */
  skipPreferenceCheck?: boolean;
}

const transporterCache = new Map<EmailType, ReturnType<typeof nodemailer.createTransport>>();

function getTransporter(type: EmailType) {
  const cached = transporterCache.get(type);
  if (cached) return cached;

  let user, pass;

  switch (type) {
    case "support":
      user = process.env.SMTP_SUPPORT_USER;
      pass = process.env.SMTP_SUPPORT_PASS;
      break;
    case "alerts":
      user = process.env.SMTP_ALERTS_USER;
      pass = process.env.SMTP_ALERTS_PASS;
      break;
    case "marketing":
      user = process.env.SMTP_MARKETING_USER;
      pass = process.env.SMTP_MARKETING_PASS;
      break;
    case "security":
      user = process.env.SMTP_SECURITY_USER;
      pass = process.env.SMTP_SECURITY_PASS;
      break;
  }

  if (!user || !pass) {
    console.warn(`[SMTP] Missing credentials for ${type}`);
    return null;
  }

  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.siteprotect.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
  });
  transporterCache.set(type, t);
  return t;
}

/** Map preferenceKey from template name for auto-lookup */
function templateToPreferenceKey(template: TemplateName): string | undefined {
  const map: Record<string, string> = {
    passwordChanged: "account_security.password_changed",
    failedLogin: "account_security.failed_login",
    accountLocked: "account_security.account_locked",
    personalInfoChanged: "account_security.personal_info_changed",
    dailyLoss: "trading_alerts.daily_loss_limit",
    maxExposure: "trading_alerts.max_exposure",
    riskOfRuin: "trading_alerts.risk_of_ruin",
    consecutiveLoss: "trading_alerts.consecutive_losses",
    anomaly: "trading_alerts.anomaly_circuit_breaker",
    macroEvent: "trading_alerts.macro_event_blackout",
    tradeExecuted: "trading_alerts.trade_executed",
    tradeClosed: "trading_alerts.trade_closed",
    dailySummary: "performance_reports.daily_summary",
    weeklyDigest: "performance_reports.weekly_digest",
    monthlyReport: "performance_reports.monthly_report",
    milestone: "performance_reports.milestone_achievements",
    newsletter: "marketing.newsletter",
    featureAnnouncement: "marketing.feature_announcements",
    inactivity: "marketing.inactivity_reminders",
  };
  return map[template];
}

export async function sendEmail({
  to,
  type,
  subject,
  html,
  template,
  data,
  attachments,
  userId,
  preferenceKey,
  skipPreferenceCheck,
}: SendOptions) {
  const transporter = getTransporter(type);
  if (!transporter) return;

  // ── Preference check ──
  const resolvedPrefKey = preferenceKey || (template ? templateToPreferenceKey(template) : undefined);
  const isSecurityEmail = skipPreferenceCheck || (resolvedPrefKey ? SECURITY_KEYS.has(resolvedPrefKey) : false);

  if (!isSecurityEmail && userId && resolvedPrefKey) {
    try {
      const rows = await query<{ preferences: any }>(
        "SELECT preferences FROM users WHERE uid = $1",
        [userId]
      );
      if (rows.length) {
        const prefs = mergePreferences(rows[0].preferences);
        if (!isPreferenceEnabled(prefs, resolvedPrefKey)) {
          console.log(`[SMTP] Skipped ${template || "custom"} email to ${to} (preference disabled: ${resolvedPrefKey})`);
          // Log as skipped
          try {
            await query(
              `INSERT INTO email_log (uid, template, subject, to_addr)
               VALUES ($1, $2, $3, $4)`,
              [userId || "system", (template || "custom") + ":skipped", subject, to]
            );
          } catch { /* non-critical */ }
          return;
        }
      }
    } catch (err) {
      console.warn("[SMTP] Preference check failed, sending anyway:", err);
    }
  }

  // ── Build unsubscribe URL ──
  let unsub: string | undefined;
  if (!isSecurityEmail && userId && resolvedPrefKey) {
    const category = resolvedPrefKey.split(".")[0];
    unsub = unsubscribeUrl(userId, category);
  }

  // ── Render template ──
  let body = html || "";

  if (template) {
    switch (template) {
      // Legacy templates (backwards compatible)
      case "verify":
        body = verifyEmail(data.url, unsub);
        break;
      case "welcome":
        body = welcomeEmail(data.name || data.firstName, unsub);
        break;
      case "contact":
        body = `<div style="font-family:sans-serif;color:#374151;padding:20px;">
          <h2 style="color:#111827;">We received your message</h2>
          <p>Hi ${data.name ? escapeHtml(data.name) : "there"},</p>
          <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
          ${data.message ? `<blockquote style="border-left:3px solid #06b6d4;padding-left:12px;color:#6b7280;margin:16px 0;">${escapeHtml(data.message)}</blockquote>` : ""}
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Nova by Horizon | <a href="https://horizonsvc.com">horizonsvc.com</a></p>
        </div>`;
        break;
      case "ticket":
        body = `<div style="font-family:sans-serif;color:#374151;padding:20px;">
          <h2 style="color:#111827;">Support Request #${data.ticketId || ""}</h2>
          <p>Your ticket has been received and assigned. We'll respond within 24 hours.</p>
          ${data.topic ? `<p><strong>Topic:</strong> ${escapeHtml(data.topic)}</p>` : ""}
          ${data.message ? `<blockquote style="border-left:3px solid #06b6d4;padding-left:12px;color:#6b7280;margin:16px 0;">${escapeHtml(data.message)}</blockquote>` : ""}
          <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Nova by Horizon | <a href="https://horizonsvc.com">horizonsvc.com</a></p>
        </div>`;
        break;
      case "security":
        body = data._legacyHtml || body;
        break;

      // New templates
      case "passwordChanged":
        body = passwordChanged(data, unsub);
        break;
      case "failedLogin":
        body = failedLoginWarning(data, unsub);
        break;
      case "accountLocked":
        body = accountLocked(data, unsub);
        break;
      case "personalInfoChanged":
        body = personalInfoChanged(data, unsub);
        break;
      case "accountDeactivated":
        body = accountDeactivated(data.firstName, unsub);
        break;
      case "botSetupStarted":
        body = botSetupStarted(data.firstName, data.botLabel, unsub);
        break;
      case "botSetupComplete":
        body = botSetupComplete(data.firstName, data.botLabel, data.dashboardUrl, unsub);
        break;
      case "dailyLoss":
        body = dailyLossAlert(data, unsub);
        break;
      case "maxExposure":
        body = maxExposureAlert(data, unsub);
        break;
      case "riskOfRuin":
        body = riskOfRuinAlert(data, unsub);
        break;
      case "consecutiveLoss":
        body = consecutiveLossAlert(data, unsub);
        break;
      case "anomaly":
        body = anomalyAlert(data, unsub);
        break;
      case "macroEvent":
        body = macroEventAlert(data, unsub);
        break;
      case "dailySummary":
        body = dailySummary(data, unsub);
        break;
      case "weeklyDigest":
        body = weeklyDigest(data, unsub);
        break;
      case "monthlyReport":
        body = monthlyReport(data, unsub);
        break;
      case "tradeExecuted":
        body = tradeExecuted(data, unsub);
        break;
      case "tradeClosed":
        body = tradeClosed(data, unsub);
        break;
      case "milestone":
        body = milestoneAchieved(data, unsub);
        break;
      case "newsletter":
        body = newsletter(data, unsub);
        break;
      case "featureAnnouncement":
        body = featureAnnouncement(data, unsub);
        break;
      case "inactivity":
        body = inactivityReengagement(data, unsub);
        break;
    }
  }

  // ── From address ──
  let from;
  switch (type) {
    case "support":
      from = process.env.SMTP_SUPPORT_FROM || "Nova by Horizon <support@horizonsvc.com>";
      break;
    case "alerts":
      from = process.env.SMTP_ALERTS_FROM || "Nova by Horizon <alerts@horizonsvc.com>";
      break;
    case "marketing":
      from = process.env.SMTP_MARKETING_FROM || "Nova by Horizon <marketing@horizonsvc.com>";
      break;
    case "security":
      from = process.env.SMTP_SECURITY_FROM || "Nova by Horizon <security@horizonsvc.com>";
      break;
  }

  // ── Headers ──
  const headers: Record<string, string> = {};
  if (unsub) {
    headers["List-Unsubscribe"] = `<${unsub}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html: body,
      attachments,
      headers,
    });
    console.log(`[SMTP] Sent ${template || "custom"} email to ${to}`);

    // Log to email_log
    try {
      await query(
        `INSERT INTO email_log (uid, template, subject, to_addr)
         VALUES ($1, $2, $3, $4)`,
        [userId || "system", template || "custom", subject, to]
      );
    } catch { /* non-critical */ }
  } catch (error) {
    console.error(`[SMTP] Error sending to ${to}:`, error);
  }
}
