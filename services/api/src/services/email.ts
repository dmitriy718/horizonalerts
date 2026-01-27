import nodemailer from "nodemailer";
import { 
  verifyEmailTemplate, 
  welcomeTemplate, 
  contactConfirmationTemplate, 
  ticketTemplate,
  securityAlertTemplate
} from "./email-templates.js";

type EmailType = "support" | "alerts" | "marketing" | "security";

interface SendOptions {
  to: string;
  type: EmailType;
  subject: string;
  html?: string;
  template?: "verify" | "welcome" | "contact" | "ticket" | "security";
  data?: any;
  attachments?: any[];
}

function getTransporter(type: EmailType) {
  // Map types to environment variables
  // Support: Account 1
  // Alerts: Account 2
  // Marketing: Account 3
  // Security: Account 4
  
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
    // Fallback or log error
    console.warn(`[SMTP] Missing credentials for ${type}`);
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.siteprotect.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465
    auth: { user, pass }
  });
}

export async function sendEmail({ to, type, subject, html, template, data, attachments }: SendOptions) {
  const transporter = getTransporter(type);
  if (!transporter) return;

  let body = html || "";
  
  // Render Template
  if (template === "verify") body = verifyEmailTemplate(data.url);
  if (template === "welcome") body = welcomeTemplate(data.name);
  if (template === "contact") body = contactConfirmationTemplate(data.name, data.message);
  if (template === "ticket") body = ticketTemplate(data.ticketId, data.topic, data.message);
  if (template === "security") body = securityAlertTemplate(data.action);

  let from;
  switch (type) {
    case "support": from = process.env.SMTP_SUPPORT_FROM || "Horizon Support <support@horizonsvc.com>"; break;
    case "alerts": from = process.env.SMTP_ALERTS_FROM || "Horizon Alerts <alerts@horizonsvc.com>"; break;
    case "marketing": from = process.env.SMTP_MARKETING_FROM || "Horizon Insights <marketing@horizonsvc.com>"; break;
    case "security": from = process.env.SMTP_SECURITY_FROM || "Horizon Security <security@horizonsvc.com>"; break;
  }

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html: body,
      attachments
    });
    console.log(`[SMTP] Sent ${template || "custom"} email to ${to}`);
  } catch (error) {
    console.error(`[SMTP] Error sending to ${to}:`, error);
  }
}
