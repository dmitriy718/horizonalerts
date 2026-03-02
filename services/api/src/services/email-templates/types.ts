/** Shared TypeScript interfaces for the Nova by Horizon email template system */

export type HeaderStyle = "brand" | "security" | "success" | "warning";

export type AlertTier = "warn25" | "warn10" | "triggered";

export interface BaseLayoutOptions {
  /** Preheader text shown in inbox preview */
  preheader: string;
  /** Header title text */
  title: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Header color scheme */
  headerStyle?: HeaderStyle;
  /** Main body HTML content */
  body: string;
  /** Unsubscribe URL (omitted for security emails) */
  unsubscribeUrl?: string;
}

/* ── Account Lifecycle ── */

export interface PasswordChangedData {
  firstName: string;
  timestamp: string;
  ipAddress: string;
}

export interface FailedLoginData {
  firstName: string;
  attemptCount: number;
  ipAddress: string;
  timestamp: string;
}

export interface AccountLockedData {
  firstName: string;
  ipAddress: string;
  timestamp: string;
}

export interface PersonalInfoChangedData {
  firstName: string;
  changedFields: string[];
  ipAddress: string;
  timestamp: string;
}

/* ── Trading Alerts ── */

export interface DailyLossAlertData {
  firstName: string;
  tier: AlertTier;
  currentLoss: number;
  limitPct: number;
  bankroll: number;
}

export interface MaxExposureAlertData {
  firstName: string;
  tier: AlertTier;
  currentExposure: number;
  limitPct: number;
  bankroll: number;
}

export interface RiskOfRuinAlertData {
  firstName: string;
  tier: AlertTier;
  currentRisk: number;
  threshold: number;
}

export interface ConsecutiveLossAlertData {
  firstName: string;
  tier: AlertTier;
  losses: number;
  limit: number;
}

export interface AnomalyAlertData {
  firstName: string;
  anomalyType: string;
  details: string;
  action: string;
}

export interface MacroEventAlertData {
  firstName: string;
  tier: AlertTier;
  eventName: string;
  eventDate: string;
  duration?: string;
}

/* ── Performance Reports ── */

export interface DailySummaryData {
  firstName: string;
  date: string;
  pnl: number;
  pnlPct: number;
  totalTrades: number;
  winRate: number;
  bestTrade: { symbol: string; pnl: number };
  worstTrade: { symbol: string; pnl: number };
  drawdown: number;
  bankroll: number;
}

export interface WeeklyDigestData {
  firstName: string;
  weekStart: string;
  weekEnd: string;
  pnl: number;
  pnlPct: number;
  totalTrades: number;
  winRate: number;
  prevWeekPnl: number;
  topStrategies: { name: string; pnl: number; trades: number }[];
  bankroll: number;
}

export interface MonthlyReportData {
  firstName: string;
  month: string;
  pnl: number;
  pnlPct: number;
  totalTrades: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  strategyBreakdown: { name: string; pnl: number; trades: number; winRate: number }[];
  bankroll: number;
}

export interface TradeExecutedData {
  firstName: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  size: number;
  price: number;
  strategy: string;
  stopLoss: number;
  takeProfit: number;
  timestamp: string;
}

export interface TradeClosedData {
  firstName: string;
  symbol: string;
  direction: "LONG" | "SHORT";
  pnl: number;
  pnlPct: number;
  holdTime: string;
  exitReason: string;
  entryPrice: number;
  exitPrice: number;
  timestamp: string;
}

export interface MilestoneData {
  firstName: string;
  milestone: string;
  details: string;
}

/* ── Marketing ── */

export interface NewsletterData {
  title: string;
  sections: { heading: string; body: string }[];
  ctaText: string;
  ctaUrl: string;
}

export interface FeatureAnnouncementData {
  featureName: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
}

export interface InactivityData {
  firstName: string;
  daysSinceLogin: number;
}
