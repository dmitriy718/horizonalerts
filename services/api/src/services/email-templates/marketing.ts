import { baseLayout, ctaButton, escapeHtml } from "./base-layout.js";
import type { NewsletterData, FeatureAnnouncementData, InactivityData } from "./types.js";

const SITE = "https://horizonsvc.com";

/* ── 22. Newsletter ── */
export function newsletter(data: NewsletterData, unsubscribeUrl?: string): string {
  const sections = data.sections
    .map(
      (s) => `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #f3f4f6;">
            <h3 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#111827;">${escapeHtml(s.heading)}</h3>
            <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">${s.body}</p>
          </td>
        </tr>`
    )
    .join("");

  return baseLayout({
    preheader: data.title,
    title: data.title,
    subtitle: "Nova by Horizon Newsletter",
    headerStyle: "brand",
    unsubscribeUrl,
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        ${sections}
      </table>
      ${data.ctaUrl ? ctaButton(data.ctaText || "Learn More", data.ctaUrl) : ""}
    `,
  });
}

/* ── 23. Feature Announcement ── */
export function featureAnnouncement(data: FeatureAnnouncementData, unsubscribeUrl?: string): string {
  return baseLayout({
    preheader: `New feature: ${data.featureName}`,
    title: "New Feature",
    subtitle: data.featureName,
    headerStyle: "brand",
    unsubscribeUrl,
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        <tr>
          <td style="background:linear-gradient(135deg,#eff6ff 0%,#eef2ff 100%);border:1px solid #c7d2fe;border-radius:12px;padding:24px;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">&#9889;</div>
            <div style="font-size:18px;font-weight:800;color:#4f46e5;">${escapeHtml(data.featureName)}</div>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        ${data.description}
      </p>
      ${data.ctaUrl ? ctaButton(data.ctaText || "Try It Now", data.ctaUrl) : ""}
    `,
  });
}

/* ── 24. Inactivity Re-engagement ── */
export function inactivityReengagement(data: InactivityData, unsubscribeUrl?: string): string {
  const safe = escapeHtml(data.firstName);
  return baseLayout({
    preheader: `We haven't seen you in ${data.daysSinceLogin} days — your dashboard is waiting`,
    title: "We Miss You",
    subtitle: `It's been ${data.daysSinceLogin} days`,
    headerStyle: "brand",
    unsubscribeUrl,
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Hi ${safe},
      </p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.6;">
        It's been <strong>${data.daysSinceLogin} days</strong> since you last logged in. Your Nova dashboard is ready and waiting with the latest market insights.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        <tr>
          <td style="background-color:#f3f4f6;border-radius:8px;padding:20px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#374151;">While you were away:</p>
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;line-height:1.5;">- New trading signals have been generated</p>
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;line-height:1.5;">- Market conditions and strategies have been updated</p>
            <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">- Your dashboard analytics are ready to review</p>
          </td>
        </tr>
      </table>
      ${ctaButton("Return to Dashboard", `${SITE}/dashboard`)}
      <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;text-align:center;">
        If you no longer wish to receive these reminders, you can update your notification preferences in settings.
      </p>
    `,
  });
}
