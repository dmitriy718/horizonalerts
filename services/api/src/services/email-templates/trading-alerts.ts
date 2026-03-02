import { baseLayout, escapeHtml, infoRow, progressBar, warningBox } from "./base-layout.js";
import type {
  AlertTier,
  DailyLossAlertData,
  MaxExposureAlertData,
  RiskOfRuinAlertData,
  ConsecutiveLossAlertData,
  AnomalyAlertData,
  MacroEventAlertData,
} from "./types.js";
import type { HeaderStyle } from "./types.js";

function tierHeader(tier: AlertTier): { style: HeaderStyle; label: string } {
  switch (tier) {
    case "warn25":
      return { style: "warning", label: "Advisory" };
    case "warn10":
      return { style: "warning", label: "Urgent Warning" };
    case "triggered":
      return { style: "security", label: "Failsafe Triggered" };
  }
}

function tierColor(tier: AlertTier): string {
  return tier === "triggered" ? "#ef4444" : "#f59e0b";
}

function tierNote(tier: AlertTier, failsafeName: string): string {
  if (tier === "triggered") {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;">
      <tr><td style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;">
        <p style="margin:0;font-size:13px;color:#991b1b;font-weight:600;">Action Taken: Your bot's ${escapeHtml(failsafeName)} failsafe has been triggered. Trading has been automatically paused to protect your capital.</p>
      </td></tr>
    </table>`;
  }
  if (tier === "warn10") {
    return warningBox(`Your bot is approaching its ${escapeHtml(failsafeName)} limit. If this threshold is reached, trading will be automatically paused.`);
  }
  return `<p style="margin:16px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">This is an informational alert. No action has been taken. You can adjust your failsafe thresholds in your bot configuration.</p>`;
}

function fmtUsd(n: number): string {
  return "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n: number): string {
  return n.toFixed(1) + "%";
}

/* ── 10. Daily Loss Alert ── */
export function dailyLossAlert(data: DailyLossAlertData, unsubscribeUrl?: string): string {
  const { style, label } = tierHeader(data.tier);
  const usedPct = (Math.abs(data.currentLoss) / (data.bankroll * data.limitPct / 100)) * 100;
  return baseLayout({
    preheader: `${label}: Daily loss at ${fmtUsd(data.currentLoss)} (${fmtPct(usedPct)} of limit)`,
    title: "Daily Loss Limit",
    subtitle: label,
    headerStyle: style,
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${escapeHtml(data.firstName)},
      </p>
      <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">
        Your bot's daily loss has reached <strong style="color:${tierColor(data.tier)};">${fmtUsd(data.currentLoss)}</strong>.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px;">
        ${infoRow("Current Loss", fmtUsd(data.currentLoss))}
        ${infoRow("Daily Limit", fmtPct(data.limitPct) + " of bankroll (" + fmtUsd(data.bankroll * data.limitPct / 100) + ")")}
        ${infoRow("Bankroll", fmtUsd(data.bankroll))}
      </table>
      ${progressBar(usedPct, tierColor(data.tier))}
      ${tierNote(data.tier, "daily loss limit")}
    `,
  });
}

/* ── 11. Max Exposure Alert ── */
export function maxExposureAlert(data: MaxExposureAlertData, unsubscribeUrl?: string): string {
  const { style, label } = tierHeader(data.tier);
  const usedPct = (data.currentExposure / (data.bankroll * data.limitPct / 100)) * 100;
  return baseLayout({
    preheader: `${label}: Exposure at ${fmtUsd(data.currentExposure)} (${fmtPct(usedPct)} of limit)`,
    title: "Max Exposure Limit",
    subtitle: label,
    headerStyle: style,
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${escapeHtml(data.firstName)},
      </p>
      <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">
        Your bot's total market exposure has reached <strong style="color:${tierColor(data.tier)};">${fmtUsd(data.currentExposure)}</strong>.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px;">
        ${infoRow("Current Exposure", fmtUsd(data.currentExposure))}
        ${infoRow("Exposure Limit", fmtPct(data.limitPct) + " of bankroll (" + fmtUsd(data.bankroll * data.limitPct / 100) + ")")}
        ${infoRow("Bankroll", fmtUsd(data.bankroll))}
      </table>
      ${progressBar(usedPct, tierColor(data.tier))}
      ${tierNote(data.tier, "max exposure")}
    `,
  });
}

/* ── 12. Risk of Ruin Alert ── */
export function riskOfRuinAlert(data: RiskOfRuinAlertData, unsubscribeUrl?: string): string {
  const { style, label } = tierHeader(data.tier);
  const usedPct = (data.currentRisk / data.threshold) * 100;
  return baseLayout({
    preheader: `${label}: Risk of ruin at ${fmtPct(data.currentRisk * 100)}`,
    title: "Risk of Ruin",
    subtitle: label,
    headerStyle: style,
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${escapeHtml(data.firstName)},
      </p>
      <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">
        Your bot's calculated risk of ruin has reached <strong style="color:${tierColor(data.tier)};">${fmtPct(data.currentRisk * 100)}</strong>.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px;">
        ${infoRow("Current Risk", fmtPct(data.currentRisk * 100))}
        ${infoRow("Threshold", fmtPct(data.threshold * 100))}
      </table>
      ${progressBar(usedPct, tierColor(data.tier))}
      ${tierNote(data.tier, "risk of ruin")}
    `,
  });
}

/* ── 13. Consecutive Loss Alert ── */
export function consecutiveLossAlert(data: ConsecutiveLossAlertData, unsubscribeUrl?: string): string {
  const { style, label } = tierHeader(data.tier);
  const usedPct = (data.losses / data.limit) * 100;
  return baseLayout({
    preheader: `${label}: ${data.losses} consecutive losses (limit: ${data.limit})`,
    title: "Consecutive Losses",
    subtitle: label,
    headerStyle: style,
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${escapeHtml(data.firstName)},
      </p>
      <p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6;">
        Your bot has hit <strong style="color:${tierColor(data.tier)};">${data.losses} consecutive losing trades</strong>.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px;">
        ${infoRow("Loss Streak", String(data.losses) + " trades")}
        ${infoRow("Pause Limit", String(data.limit) + " trades")}
      </table>
      ${progressBar(usedPct, tierColor(data.tier))}
      ${tierNote(data.tier, "consecutive loss")}
    `,
  });
}

/* ── 14. Anomaly / Circuit Breaker Alert ── */
export function anomalyAlert(data: AnomalyAlertData, unsubscribeUrl?: string): string {
  return baseLayout({
    preheader: `Circuit breaker: ${data.anomalyType} anomaly detected`,
    title: "Anomaly Detected",
    subtitle: "Circuit Breaker Activated",
    headerStyle: "security",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${escapeHtml(data.firstName)},
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Your bot's anomaly detector identified unusual market conditions and activated a circuit breaker.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        ${infoRow("Anomaly Type", data.anomalyType)}
        ${infoRow("Details", data.details)}
        ${infoRow("Action Taken", data.action)}
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 16px;">
        <tr><td style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;">
          <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.5;">
            Trading has been temporarily paused while the anomaly is active. Your bot will automatically resume when conditions normalize.
          </p>
        </td></tr>
      </table>
    `,
  });
}

/* ── 15. Macro Event Alert ── */
export function macroEventAlert(data: MacroEventAlertData, unsubscribeUrl?: string): string {
  const { style, label } = tierHeader(data.tier);
  return baseLayout({
    preheader: `${label}: ${data.eventName} on ${data.eventDate}`,
    title: "Macro Event Alert",
    subtitle: label,
    headerStyle: style,
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${escapeHtml(data.firstName)},
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        ${data.tier === "triggered"
          ? `Your bot has entered a <strong style="color:#dc2626;">blackout period</strong> for the upcoming macro event.`
          : `A major macro event is approaching that may affect your bot's trading activity.`}
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        ${infoRow("Event", data.eventName)}
        ${infoRow("Date", data.eventDate)}
        ${data.duration ? infoRow("Blackout Duration", data.duration) : ""}
      </table>
      ${tierNote(data.tier, "macro event blackout")}
    `,
  });
}
