/**
 * Bot Failsafe Monitoring Service
 *
 * Runs inside the API process. Every 60 seconds, polls each active
 * bot connection for risk/alerts data and sends tiered email notifications
 * when failsafe thresholds are approached or triggered.
 *
 * Also handles scheduled report delivery (daily/weekly/monthly).
 */

import { query } from "../db.js";
import { sendEmail } from "./email.js";
import { mergePreferences, isPreferenceEnabled } from "./preference-utils.js";

type AlertTier = "warn25" | "warn10" | "triggered";

interface BotConnection {
  uid: string;
  email: string;
  first_name: string;
  bot_url: string;
  api_key: string;
  preferences: any;
}

// In-memory dedup: tracks last sent tier per user+alert type
// Key: `${uid}:${alertType}`, Value: { tier, sentAt }
const alertHistory = new Map<string, { tier: AlertTier; sentAt: number }>();
const COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 hours

// Track last report send times per user
const reportHistory = new Map<string, { daily?: string; weekly?: string; monthly?: string }>();

let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Repopulate the in-memory alertHistory dedup map from the email_log table.
 * This prevents duplicate alert emails after a process restart by loading the
 * most recent send timestamp per user+alert_type within the cooldown window.
 */
async function loadAlertHistoryFromDb() {
  try {
    const rows = await query<{ uid: string; subject: string; sent_at: string }>(
      `SELECT DISTINCT ON (uid, subject)
              uid, subject, sent_at
       FROM email_log
       WHERE template NOT LIKE '%:skipped' AND sent_at > now() - interval '4 hours'
       ORDER BY uid, subject, sent_at DESC`
    );
    for (const row of rows) {
      // Extract tier from subject: "FAILSAFE:" → triggered, "Alert:" → warn10/warn25
      const tier: AlertTier = row.subject.startsWith("FAILSAFE") ? "triggered" : "warn10";
      // Build a dedup key from uid + a normalized alert type derived from the subject
      const alertType = row.subject.replace(/^(FAILSAFE|Alert):?\s*/, "").split(" — ")[0].trim();
      const key = `${row.uid}:${alertType}`;
      alertHistory.set(key, { tier, sentAt: new Date(row.sent_at).getTime() });
    }
    if (rows.length > 0) {
      console.log(`[BotMonitor] Loaded ${rows.length} alert history entries from email_log`);
    }
  } catch (err) {
    console.warn("[BotMonitor] Could not load alert history from DB:", err);
  }
}

export function startBotMonitor() {
  if (intervalId) return;
  console.log("[BotMonitor] Starting failsafe monitoring (60s interval)");
  // Load dedup state from DB before starting the loop
  loadAlertHistoryFromDb();
  intervalId = setInterval(monitorLoop, 60_000);
  // Run once on startup after a short delay
  setTimeout(monitorLoop, 5_000);
}

export function stopBotMonitor() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("[BotMonitor] Stopped");
  }
}

async function monitorLoop() {
  try {
    // 1. Fetch all active bot connections with user info
    const connections = await query<BotConnection>(
      `SELECT bc.uid, u.email, u.first_name, bc.bot_url, bc.api_key, u.preferences
       FROM bot_connections bc
       JOIN users u ON bc.uid = u.uid
       WHERE bc.status = 'active'`
    );

    // Fan out failsafe checks concurrently (max 10 at a time)
    for (let i = 0; i < connections.length; i += 10) {
      const batch = connections.slice(i, i + 10);
      await Promise.allSettled(
        batch.map((conn) =>
          checkBotFailsafes(conn).catch((err) =>
            console.warn(`[BotMonitor] Error checking bot for ${conn.uid}:`, err)
          )
        )
      );
    }

    // 2. Check report schedules
    await checkReportSchedules(connections);
  } catch (err) {
    console.error("[BotMonitor] Loop error:", err);
  }
}

async function fetchBotApi(botUrl: string, apiKey: string, endpoint: string): Promise<any> {
  const url = `${botUrl}/api/v1${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      headers: { "X-API-Key": apiKey },
      signal: controller.signal,
      redirect: "error", // Never follow redirects (SSRF protection)
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function determineTier(current: number, limit: number): AlertTier | null {
  if (limit <= 0) return null;
  const remaining = 1 - current / limit;
  if (remaining <= 0) return "triggered";
  if (remaining <= 0.10) return "warn10";
  if (remaining <= 0.25) return "warn25";
  return null;
}

function shouldSendAlert(uid: string, alertType: string, tier: AlertTier): boolean {
  const key = `${uid}:${alertType}`;
  const prev = alertHistory.get(key);
  const now = Date.now();

  if (!prev) return true;
  // Send on escalation
  const tierOrder: Record<AlertTier, number> = { warn25: 1, warn10: 2, triggered: 3 };
  if (tierOrder[tier] > tierOrder[prev.tier]) return true;
  // Send on cooldown expiry (same or lower tier)
  if (now - prev.sentAt > COOLDOWN_MS) return true;
  return false;
}

function recordAlert(uid: string, alertType: string, tier: AlertTier) {
  alertHistory.set(`${uid}:${alertType}`, { tier, sentAt: Date.now() });
}

async function checkBotFailsafes(conn: BotConnection) {
  const prefs = mergePreferences(conn.preferences);
  const firstName = conn.first_name || "Trader";

  // Fetch risk data
  const risk = await fetchBotApi(conn.bot_url, conn.api_key, "/risk");
  if (!risk) return;

  const bankroll = risk.bankroll || risk.balance || 0;
  if (bankroll <= 0) return;

  // Daily Loss
  if (risk.daily_pnl !== undefined && risk.daily_loss_limit_pct) {
    const loss = Math.abs(Math.min(0, risk.daily_pnl));
    const limitAmt = bankroll * risk.daily_loss_limit_pct / 100;
    const tier = determineTier(loss, limitAmt);
    if (tier && shouldSendAlert(conn.uid, "dailyLoss", tier) && isPreferenceEnabled(prefs, "trading_alerts.daily_loss_limit")) {
      await sendEmail({
        to: conn.email,
        type: "alerts",
        subject: `${tier === "triggered" ? "FAILSAFE" : "Alert"}: Daily Loss Limit — ${firstName}`,
        template: "dailyLoss",
        data: { firstName, tier, currentLoss: loss, limitPct: risk.daily_loss_limit_pct, bankroll },
        userId: conn.uid,
        preferenceKey: "trading_alerts.daily_loss_limit",
      });
      recordAlert(conn.uid, "dailyLoss", tier);
    }
  }

  // Max Exposure
  if (risk.total_exposure !== undefined && risk.max_exposure_pct) {
    const tier = determineTier(risk.total_exposure, bankroll * risk.max_exposure_pct / 100);
    if (tier && shouldSendAlert(conn.uid, "maxExposure", tier) && isPreferenceEnabled(prefs, "trading_alerts.max_exposure")) {
      await sendEmail({
        to: conn.email,
        type: "alerts",
        subject: `${tier === "triggered" ? "FAILSAFE" : "Alert"}: Max Exposure — ${firstName}`,
        template: "maxExposure",
        data: { firstName, tier, currentExposure: risk.total_exposure, limitPct: risk.max_exposure_pct, bankroll },
        userId: conn.uid,
        preferenceKey: "trading_alerts.max_exposure",
      });
      recordAlert(conn.uid, "maxExposure", tier);
    }
  }

  // Consecutive Losses
  if (risk.consecutive_losses !== undefined && risk.consecutive_loss_limit) {
    const tier = determineTier(risk.consecutive_losses, risk.consecutive_loss_limit);
    if (tier && shouldSendAlert(conn.uid, "consecutiveLoss", tier) && isPreferenceEnabled(prefs, "trading_alerts.consecutive_losses")) {
      await sendEmail({
        to: conn.email,
        type: "alerts",
        subject: `${tier === "triggered" ? "FAILSAFE" : "Alert"}: Consecutive Losses — ${firstName}`,
        template: "consecutiveLoss",
        data: { firstName, tier, losses: risk.consecutive_losses, limit: risk.consecutive_loss_limit },
        userId: conn.uid,
        preferenceKey: "trading_alerts.consecutive_losses",
      });
      recordAlert(conn.uid, "consecutiveLoss", tier);
    }
  }

  // Risk of Ruin
  if (risk.risk_of_ruin !== undefined && risk.risk_of_ruin_threshold) {
    const tier = determineTier(risk.risk_of_ruin, risk.risk_of_ruin_threshold);
    if (tier && shouldSendAlert(conn.uid, "riskOfRuin", tier) && isPreferenceEnabled(prefs, "trading_alerts.risk_of_ruin")) {
      await sendEmail({
        to: conn.email,
        type: "alerts",
        subject: `${tier === "triggered" ? "FAILSAFE" : "Alert"}: Risk of Ruin — ${firstName}`,
        template: "riskOfRuin",
        data: { firstName, tier, currentRisk: risk.risk_of_ruin, threshold: risk.risk_of_ruin_threshold },
        userId: conn.uid,
        preferenceKey: "trading_alerts.risk_of_ruin",
      });
      recordAlert(conn.uid, "riskOfRuin", tier);
    }
  }

  // Check anomalies
  const anomalies = await fetchBotApi(conn.bot_url, conn.api_key, "/anomalies");
  if (anomalies?.active_anomalies?.length && isPreferenceEnabled(prefs, "trading_alerts.anomaly_circuit_breaker")) {
    for (const a of anomalies.active_anomalies) {
      const aKey = `anomaly_${a.type || "unknown"}`;
      if (shouldSendAlert(conn.uid, aKey, "triggered")) {
        await sendEmail({
          to: conn.email,
          type: "alerts",
          subject: `Circuit Breaker: ${a.type || "Anomaly"} Detected`,
          template: "anomaly",
          data: { firstName, anomalyType: a.type || "Unknown", details: a.details || a.message || "", action: a.action || "Trading paused" },
          userId: conn.uid,
          preferenceKey: "trading_alerts.anomaly_circuit_breaker",
        });
        recordAlert(conn.uid, aKey, "triggered");
      }
    }
  }

  // Check macro events
  const events = await fetchBotApi(conn.bot_url, conn.api_key, "/events");
  if (events?.upcoming?.length && isPreferenceEnabled(prefs, "trading_alerts.macro_event_blackout")) {
    for (const ev of events.upcoming) {
      const evKey = `macro_${ev.name || "event"}`;
      // Determine tier based on time until event
      const eventTime = new Date(ev.date).getTime();
      const now = Date.now();
      const hoursUntil = (eventTime - now) / (1000 * 60 * 60);
      if (hoursUntil < 0) continue; // skip past events
      let tier: AlertTier = "warn25";
      if (hoursUntil <= 1) tier = "triggered";
      else if (hoursUntil <= 4) tier = "warn10";

      if (shouldSendAlert(conn.uid, evKey, tier)) {
        await sendEmail({
          to: conn.email,
          type: "alerts",
          subject: `Macro Event: ${ev.name} — ${tier === "triggered" ? "Blackout Active" : "Approaching"}`,
          template: "macroEvent",
          data: { firstName, tier, eventName: ev.name, eventDate: ev.date, duration: ev.duration },
          userId: conn.uid,
          preferenceKey: "trading_alerts.macro_event_blackout",
        });
        recordAlert(conn.uid, evKey, tier);
      }
    }
  }
}

async function checkReportSchedules(connections: BotConnection[]) {
  const now = new Date();
  const hour = now.getUTCHours();
  const minute = now.getUTCMinutes();
  const dayOfWeek = now.getUTCDay(); // 0=Sunday
  const dayOfMonth = now.getUTCDate();
  const dateStr = now.toISOString().slice(0, 10);

  // Only check at the top of the hour (within the 60s window)
  if (minute > 1) return;

  for (const conn of connections) {
    const prefs = mergePreferences(conn.preferences);
    const firstName = conn.first_name || "Trader";
    const history = reportHistory.get(conn.uid) || {};

    // Daily summary at 00:00 UTC
    if (hour === 0 && history.daily !== dateStr && isPreferenceEnabled(prefs, "performance_reports.daily_summary")) {
      const stats = await fetchBotApi(conn.bot_url, conn.api_key, "/performance");
      if (stats) {
        await sendEmail({
          to: conn.email,
          type: "alerts",
          subject: `Daily Summary — ${dateStr}`,
          template: "dailySummary",
          data: {
            firstName,
            date: dateStr,
            pnl: stats.daily_pnl || 0,
            pnlPct: stats.daily_pnl_pct || 0,
            totalTrades: stats.daily_trades || 0,
            winRate: stats.win_rate || 0,
            bestTrade: stats.best_trade || { symbol: "N/A", pnl: 0 },
            worstTrade: stats.worst_trade || { symbol: "N/A", pnl: 0 },
            drawdown: stats.max_drawdown || 0,
            bankroll: stats.bankroll || stats.balance || 0,
          },
          userId: conn.uid,
          preferenceKey: "performance_reports.daily_summary",
        });
        history.daily = dateStr;
        reportHistory.set(conn.uid, history);
      }
    }

    // Weekly digest on Sunday at 00:00 UTC
    if (hour === 0 && dayOfWeek === 0 && history.weekly !== dateStr && isPreferenceEnabled(prefs, "performance_reports.weekly_digest")) {
      const stats = await fetchBotApi(conn.bot_url, conn.api_key, "/performance");
      if (stats) {
        const weekEnd = dateStr;
        const weekStartDate = new Date(now);
        weekStartDate.setDate(weekStartDate.getDate() - 7);
        const weekStart = weekStartDate.toISOString().slice(0, 10);
        await sendEmail({
          to: conn.email,
          type: "alerts",
          subject: `Weekly Digest — ${weekStart} to ${weekEnd}`,
          template: "weeklyDigest",
          data: {
            firstName,
            weekStart,
            weekEnd,
            pnl: stats.weekly_pnl || 0,
            pnlPct: stats.weekly_pnl_pct || 0,
            totalTrades: stats.weekly_trades || 0,
            winRate: stats.win_rate || 0,
            prevWeekPnl: stats.prev_week_pnl || 0,
            topStrategies: stats.top_strategies || [],
            bankroll: stats.bankroll || stats.balance || 0,
          },
          userId: conn.uid,
          preferenceKey: "performance_reports.weekly_digest",
        });
        history.weekly = dateStr;
        reportHistory.set(conn.uid, history);
      }
    }

    // Monthly report on 1st at 00:00 UTC
    if (hour === 0 && dayOfMonth === 1 && history.monthly !== dateStr && isPreferenceEnabled(prefs, "performance_reports.monthly_report")) {
      const stats = await fetchBotApi(conn.bot_url, conn.api_key, "/performance");
      if (stats) {
        const prevMonth = new Date(now);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        const monthLabel = prevMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
        await sendEmail({
          to: conn.email,
          type: "alerts",
          subject: `Monthly Report — ${monthLabel}`,
          template: "monthlyReport",
          data: {
            firstName,
            month: monthLabel,
            pnl: stats.monthly_pnl || 0,
            pnlPct: stats.monthly_pnl_pct || 0,
            totalTrades: stats.monthly_trades || 0,
            winRate: stats.win_rate || 0,
            sharpeRatio: stats.sharpe_ratio || 0,
            maxDrawdown: stats.max_drawdown || 0,
            strategyBreakdown: stats.strategy_breakdown || [],
            bankroll: stats.bankroll || stats.balance || 0,
          },
          userId: conn.uid,
          preferenceKey: "performance_reports.monthly_report",
        });
        history.monthly = dateStr;
        reportHistory.set(conn.uid, history);
      }
    }
  }
}
