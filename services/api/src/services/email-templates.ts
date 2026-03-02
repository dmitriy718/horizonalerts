/**
 * @deprecated — Use the new template system at ./email-templates/index.ts instead.
 * These legacy exports are kept for backwards compatibility but delegate to the new base-layout system.
 */

import { verifyEmail, welcomeEmail } from "./email-templates/index.js";
import { baseLayout, escapeHtml } from "./email-templates/base-layout.js";

export { escapeHtml };

export const styles = ""; // No longer used; kept for import compat

export const verifyEmailTemplate = (url: string) => verifyEmail(url);

export const welcomeTemplate = (name: string) => welcomeEmail(name);

export const contactConfirmationTemplate = (name: string, message: string) => {
  const safeName = escapeHtml(name);
  const safeMessage = escapeHtml(message);
  return baseLayout({
    preheader: `We received your message, ${safeName}`,
    title: "Message Received",
    headerStyle: "brand",
    body: `
      <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">Hello ${safeName},</h2>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        Thank you for contacting Horizon Support. We have received your message and a member of our team will review it shortly.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;">
        <tr>
          <td style="background:#f3f4f6;padding:15px;border-left:4px solid #4f46e5;border-radius:0 6px 6px 0;">
            <strong style="font-size:13px;color:#374151;">Your Message:</strong><br/>
            <em style="font-size:13px;color:#555;">"${safeMessage}"</em>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">Our typical response time is under 24 hours.</p>
    `,
  });
};

export const ticketTemplate = (ticketId: string, topic: string, message: string) => {
  const safeTopic = escapeHtml(topic);
  const safeMessage = escapeHtml(message);
  const safeTicketId = escapeHtml(ticketId);
  return baseLayout({
    preheader: `Support Ticket #${safeTicketId} — ${safeTopic}`,
    title: `Support Ticket #${safeTicketId}`,
    subtitle: safeTopic,
    headerStyle: "brand",
    body: `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        We have logged your support request. Our engineering team has been notified.
      </p>
      <hr style="border:0;border-top:1px solid #eee;margin:20px 0;" />
      <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">${safeMessage}</p>
      <hr style="border:0;border-top:1px solid #eee;margin:20px 0;" />
      <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">You can reply directly to this email to add more information.</p>
    `,
  });
};

export const securityAlertTemplate = (action: string) => {
  const safeAction = escapeHtml(action);
  return baseLayout({
    preheader: `Security Alert: ${safeAction}`,
    title: "Security Alert",
    subtitle: safeAction,
    headerStyle: "security",
    body: `
      <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">Account Update: ${safeAction}</h2>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        We noticed a change to your account settings (${safeAction}).
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
        If this was you, no further action is needed.
      </p>
      <p style="margin:0;font-size:15px;color:#4f46e5;font-weight:700;line-height:1.6;">
        If you did not make this change, please contact support immediately at
        <a href="mailto:support@horizonsvc.com" style="color:#4f46e5;">support@horizonsvc.com</a> or
        <a href="tel:+18643053993" style="color:#4f46e5;">+1 864-305-3993</a>.
      </p>
    `,
  });
};
