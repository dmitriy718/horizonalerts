/**
 * Default notification preferences, deep merge utility, and preference checking.
 */

export interface NotificationChannel {
  email: boolean;
}

export interface NotificationPreferences {
  notifications: {
    account_security: {
      password_changed: NotificationChannel;
      failed_login: NotificationChannel;
      account_locked: NotificationChannel;
      personal_info_changed: NotificationChannel;
    };
    trading_alerts: {
      daily_loss_limit: NotificationChannel;
      max_exposure: NotificationChannel;
      risk_of_ruin: NotificationChannel;
      consecutive_losses: NotificationChannel;
      anomaly_circuit_breaker: NotificationChannel;
      macro_event_blackout: NotificationChannel;
      trade_executed: NotificationChannel;
      trade_closed: NotificationChannel;
    };
    performance_reports: {
      daily_summary: NotificationChannel;
      weekly_digest: NotificationChannel;
      monthly_report: NotificationChannel;
      milestone_achievements: NotificationChannel;
    };
    marketing: {
      newsletter: NotificationChannel;
      feature_announcements: NotificationChannel;
      inactivity_reminders: NotificationChannel;
    };
  };
  global_unsubscribe: boolean;
  timezone: string;
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  notifications: {
    account_security: {
      password_changed: { email: true },
      failed_login: { email: true },
      account_locked: { email: true },
      personal_info_changed: { email: true },
    },
    trading_alerts: {
      daily_loss_limit: { email: true },
      max_exposure: { email: true },
      risk_of_ruin: { email: true },
      consecutive_losses: { email: true },
      anomaly_circuit_breaker: { email: true },
      macro_event_blackout: { email: true },
      trade_executed: { email: false },
      trade_closed: { email: false },
    },
    performance_reports: {
      daily_summary: { email: true },
      weekly_digest: { email: true },
      monthly_report: { email: true },
      milestone_achievements: { email: true },
    },
    marketing: {
      newsletter: { email: true },
      feature_announcements: { email: true },
      inactivity_reminders: { email: true },
    },
  },
  global_unsubscribe: false,
  timezone: "America/New_York",
};

/**
 * Deep merge stored preferences with defaults so newly added keys are always present.
 */
export function mergePreferences(stored: Record<string, any> | null): NotificationPreferences {
  if (!stored) return { ...DEFAULT_PREFERENCES };
  return deepMerge(DEFAULT_PREFERENCES, stored) as NotificationPreferences;
}

function deepMerge(defaults: any, overrides: any): any {
  if (typeof defaults !== "object" || defaults === null) return overrides ?? defaults;
  if (typeof overrides !== "object" || overrides === null) return overrides ?? defaults;

  const result: any = { ...defaults };
  for (const key of Object.keys(overrides)) {
    if (key in defaults && typeof defaults[key] === "object" && !Array.isArray(defaults[key])) {
      result[key] = deepMerge(defaults[key], overrides[key]);
    } else {
      result[key] = overrides[key];
    }
  }
  return result;
}

/**
 * Category key map: maps a preferenceKey string to the path in the preferences object.
 * e.g. "trading_alerts.daily_loss_limit" → notifications.trading_alerts.daily_loss_limit.email
 */
export function isPreferenceEnabled(
  prefs: NotificationPreferences,
  preferenceKey: string
): boolean {
  // Security notifications can never be disabled, even with global_unsubscribe
  if (SECURITY_KEYS.has(preferenceKey)) return true;

  if (prefs.global_unsubscribe) return false;

  const parts = preferenceKey.split(".");
  if (parts.length !== 2) return true; // unknown key → allow

  const [category, key] = parts;
  const cat = (prefs.notifications as any)?.[category];
  if (!cat) return true;
  const setting = cat[key];
  if (!setting) return true;
  return setting.email !== false;
}

/**
 * Security preference keys that can never be disabled.
 */
export const SECURITY_KEYS = new Set([
  "account_security.password_changed",
  "account_security.failed_login",
  "account_security.account_locked",
  "account_security.personal_info_changed",
]);
