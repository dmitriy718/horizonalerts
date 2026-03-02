/** Re-export all email templates from the Nova by Horizon template system */

export { baseLayout, ctaButton, escapeHtml, infoRow, progressBar, warningBox } from "./base-layout.js";

export {
  verifyEmail,
  welcomeEmail,
  passwordChanged,
  failedLoginWarning,
  accountLocked,
  personalInfoChanged,
  accountDeactivated,
} from "./account-lifecycle.js";

export {
  botSetupStarted,
  botSetupComplete,
} from "./bot-setup.js";

export {
  dailyLossAlert,
  maxExposureAlert,
  riskOfRuinAlert,
  consecutiveLossAlert,
  anomalyAlert,
  macroEventAlert,
} from "./trading-alerts.js";

export {
  dailySummary,
  weeklyDigest,
  monthlyReport,
  tradeExecuted,
  tradeClosed,
  milestoneAchieved,
} from "./performance-reports.js";

export {
  newsletter,
  featureAnnouncement,
  inactivityReengagement,
} from "./marketing.js";

export type * from "./types.js";
