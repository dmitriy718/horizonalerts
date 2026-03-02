import { baseLayout, ctaButton, escapeHtml, infoRow } from "./base-layout.js";
import type {
  DailySummaryData,
  WeeklyDigestData,
  MonthlyReportData,
  TradeExecutedData,
  TradeClosedData,
  MilestoneData,
} from "./types.js";

const SITE = "https://horizonsvc.com";

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "-";
  return sign + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return sign + n.toFixed(2) + "%";
}

function pnlColor(n: number): string {
  return n >= 0 ? "#059669" : "#dc2626";
}

function statCell(label: string, value: string, color?: string): string {
  return `<td style="padding:12px;text-align:center;">
    <div style="font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">${escapeHtml(label)}</div>
    <div style="font-size:18px;font-weight:700;color:${color || "#111827"};margin-top:4px;">${escapeHtml(value)}</div>
  </td>`;
}

/* ── 16. Daily Summary ── */
export function dailySummary(data: DailySummaryData, unsubscribeUrl?: string): string {
  return baseLayout({
    preheader: `Daily P&L: ${fmtUsd(data.pnl)} (${fmtPct(data.pnlPct)}) — ${data.date}`,
    title: "Daily Summary",
    subtitle: data.date,
    headerStyle: data.pnl >= 0 ? "success" : "security",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${escapeHtml(data.firstName)}, here's your trading summary for <strong>${escapeHtml(data.date)}</strong>.
      </p>

      <!-- Stats grid -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr style="background-color:#f9fafb;">
          ${statCell("P&L", fmtUsd(data.pnl), pnlColor(data.pnl))}
          ${statCell("Return", fmtPct(data.pnlPct), pnlColor(data.pnlPct))}
          ${statCell("Trades", String(data.totalTrades))}
          ${statCell("Win Rate", data.winRate.toFixed(0) + "%")}
        </tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        ${infoRow("Best Trade", data.bestTrade.symbol + " " + fmtUsd(data.bestTrade.pnl))}
        ${infoRow("Worst Trade", data.worstTrade.symbol + " " + fmtUsd(data.worstTrade.pnl))}
        ${infoRow("Max Drawdown", data.drawdown.toFixed(2) + "%")}
        ${infoRow("Bankroll", "$" + data.bankroll.toLocaleString("en-US", { minimumFractionDigits: 2 }))}
      </table>

      ${ctaButton("View Full Dashboard", `${SITE}/dashboard`, data.pnl >= 0 ? "#059669" : "#4f46e5")}
    `,
  });
}

/* ── 17. Weekly Digest ── */
export function weeklyDigest(data: WeeklyDigestData, unsubscribeUrl?: string): string {
  const weekChange = data.pnl - data.prevWeekPnl;
  const stratRows = data.topStrategies
    .map(
      (s) =>
        `<tr>
          <td style="padding:8px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${escapeHtml(s.name)}</td>
          <td style="padding:8px 12px;font-size:13px;color:${pnlColor(s.pnl)};font-weight:600;border-bottom:1px solid #f3f4f6;text-align:right;">${fmtUsd(s.pnl)}</td>
          <td style="padding:8px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;text-align:right;">${s.trades} trades</td>
        </tr>`
    )
    .join("");

  return baseLayout({
    preheader: `Weekly P&L: ${fmtUsd(data.pnl)} — ${data.weekStart} to ${data.weekEnd}`,
    title: "Weekly Digest",
    subtitle: `${data.weekStart} — ${data.weekEnd}`,
    headerStyle: data.pnl >= 0 ? "success" : "security",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${escapeHtml(data.firstName)}, here's your week in review.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr style="background-color:#f9fafb;">
          ${statCell("Weekly P&L", fmtUsd(data.pnl), pnlColor(data.pnl))}
          ${statCell("Return", fmtPct(data.pnlPct), pnlColor(data.pnlPct))}
          ${statCell("Trades", String(data.totalTrades))}
          ${statCell("Win Rate", data.winRate.toFixed(0) + "%")}
        </tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 8px;">
        ${infoRow("Week-over-Week", fmtUsd(weekChange) + (weekChange >= 0 ? " improvement" : " decline"))}
        ${infoRow("Bankroll", "$" + data.bankroll.toLocaleString("en-US", { minimumFractionDigits: 2 }))}
      </table>

      ${data.topStrategies.length > 0 ? `
      <p style="margin:24px 0 8px;font-size:14px;font-weight:700;color:#374151;">Top Strategies</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">Strategy</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;text-align:right;">P&L</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;text-align:right;">Volume</td>
        </tr>
        ${stratRows}
      </table>` : ""}

      ${ctaButton("View Dashboard", `${SITE}/dashboard`, "#4f46e5")}
    `,
  });
}

/* ── 18. Monthly Report ── */
export function monthlyReport(data: MonthlyReportData, unsubscribeUrl?: string): string {
  const stratRows = data.strategyBreakdown
    .map(
      (s) =>
        `<tr>
          <td style="padding:8px 12px;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${escapeHtml(s.name)}</td>
          <td style="padding:8px 12px;font-size:13px;color:${pnlColor(s.pnl)};font-weight:600;border-bottom:1px solid #f3f4f6;text-align:right;">${fmtUsd(s.pnl)}</td>
          <td style="padding:8px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;text-align:right;">${s.trades}</td>
          <td style="padding:8px 12px;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;text-align:right;">${s.winRate.toFixed(0)}%</td>
        </tr>`
    )
    .join("");

  return baseLayout({
    preheader: `Monthly Report: ${fmtUsd(data.pnl)} (${fmtPct(data.pnlPct)}) — ${data.month}`,
    title: "Monthly Report",
    subtitle: data.month,
    headerStyle: data.pnl >= 0 ? "success" : "security",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${escapeHtml(data.firstName)}, here's your full report for <strong>${escapeHtml(data.month)}</strong>.
      </p>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr style="background-color:#f9fafb;">
          ${statCell("Monthly P&L", fmtUsd(data.pnl), pnlColor(data.pnl))}
          ${statCell("Return", fmtPct(data.pnlPct), pnlColor(data.pnlPct))}
          ${statCell("Trades", String(data.totalTrades))}
          ${statCell("Win Rate", data.winRate.toFixed(0) + "%")}
        </tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        ${infoRow("Sharpe Ratio", data.sharpeRatio.toFixed(2))}
        ${infoRow("Max Drawdown", data.maxDrawdown.toFixed(2) + "%")}
        ${infoRow("Bankroll", "$" + data.bankroll.toLocaleString("en-US", { minimumFractionDigits: 2 }))}
      </table>

      ${data.strategyBreakdown.length > 0 ? `
      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#374151;">Strategy Breakdown</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr style="background-color:#f9fafb;">
          <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;">Strategy</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;text-align:right;">P&L</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;text-align:right;">Trades</td>
          <td style="padding:8px 12px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;text-align:right;">Win%</td>
        </tr>
        ${stratRows}
      </table>` : ""}

      ${ctaButton("View Full Dashboard", `${SITE}/dashboard`, "#4f46e5")}
    `,
  });
}

/* ── 19. Trade Executed ── */
export function tradeExecuted(data: TradeExecutedData, unsubscribeUrl?: string): string {
  const dirColor = data.direction === "LONG" ? "#059669" : "#dc2626";
  return baseLayout({
    preheader: `${data.direction} ${data.symbol} — ${data.strategy} strategy`,
    title: "Trade Executed",
    subtitle: `${data.direction} ${data.symbol}`,
    headerStyle: "brand",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${escapeHtml(data.firstName)}, a new trade has been opened.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;width:140px;">Direction</td>
          <td style="padding:8px 0;font-size:13px;font-weight:700;color:${dirColor};border-bottom:1px solid #f3f4f6;">${data.direction}</td>
        </tr>
        ${infoRow("Symbol", data.symbol)}
        ${infoRow("Size", String(data.size))}
        ${infoRow("Entry Price", "$" + data.price.toLocaleString("en-US", { minimumFractionDigits: 2 }))}
        ${infoRow("Strategy", data.strategy)}
        ${infoRow("Stop Loss", "$" + data.stopLoss.toLocaleString("en-US", { minimumFractionDigits: 2 }))}
        ${infoRow("Take Profit", "$" + data.takeProfit.toLocaleString("en-US", { minimumFractionDigits: 2 }))}
        ${infoRow("Time", data.timestamp)}
      </table>
      ${ctaButton("View Position", `${SITE}/dashboard`, "#4f46e5")}
    `,
  });
}

/* ── 20. Trade Closed ── */
export function tradeClosed(data: TradeClosedData, unsubscribeUrl?: string): string {
  return baseLayout({
    preheader: `${data.symbol} closed: ${fmtUsd(data.pnl)} (${fmtPct(data.pnlPct)})`,
    title: "Trade Closed",
    subtitle: `${data.symbol} — ${fmtUsd(data.pnl)}`,
    headerStyle: data.pnl >= 0 ? "success" : "security",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${escapeHtml(data.firstName)}, a trade has been closed.
      </p>

      <!-- P&L highlight -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        <tr>
          <td style="background-color:${data.pnl >= 0 ? "#f0fdf4" : "#fef2f2"};border:1px solid ${data.pnl >= 0 ? "#bbf7d0" : "#fecaca"};border-radius:8px;padding:20px;text-align:center;">
            <div style="font-size:11px;color:#6b7280;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Realized P&L</div>
            <div style="font-size:28px;font-weight:800;color:${pnlColor(data.pnl)};margin-top:4px;">${fmtUsd(data.pnl)}</div>
            <div style="font-size:14px;color:${pnlColor(data.pnlPct)};margin-top:2px;">${fmtPct(data.pnlPct)}</div>
          </td>
        </tr>
      </table>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        ${infoRow("Symbol", data.symbol)}
        ${infoRow("Direction", data.direction)}
        ${infoRow("Entry Price", "$" + data.entryPrice.toLocaleString("en-US", { minimumFractionDigits: 2 }))}
        ${infoRow("Exit Price", "$" + data.exitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 }))}
        ${infoRow("Hold Time", data.holdTime)}
        ${infoRow("Exit Reason", data.exitReason)}
        ${infoRow("Closed At", data.timestamp)}
      </table>
      ${ctaButton("View Trade History", `${SITE}/dashboard`, "#4f46e5")}
    `,
  });
}

/* ── 21. Milestone Achieved ── */
export function milestoneAchieved(data: MilestoneData, unsubscribeUrl?: string): string {
  return baseLayout({
    preheader: `Achievement unlocked: ${data.milestone}`,
    title: "Milestone Achieved!",
    subtitle: data.milestone,
    headerStyle: "success",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${escapeHtml(data.firstName)},
      </p>

      <!-- Achievement badge -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        <tr>
          <td style="background:linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%);border:2px solid #059669;border-radius:12px;padding:28px;text-align:center;">
            <div style="font-size:40px;margin-bottom:8px;">&#127942;</div>
            <div style="font-size:18px;font-weight:800;color:#059669;margin-bottom:4px;">${escapeHtml(data.milestone)}</div>
            <div style="font-size:13px;color:#6b7280;">${escapeHtml(data.details)}</div>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;text-align:center;">
        Keep up the great work. Your consistency is paying off.
      </p>
      ${ctaButton("View Your Stats", `${SITE}/dashboard`, "#059669")}
    `,
  });
}
