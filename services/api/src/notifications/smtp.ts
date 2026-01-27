import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  type?: "support" | "alerts" | "marketing";
}

const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT || "587");
const secure = port === 465; // true for 465, false for other ports

// Transporter Cache
const transporters: Record<string, nodemailer.Transporter> = {};

function getTransporter(type: "support" | "alerts" | "marketing") {
  if (transporters[type]) return transporters[type];

  // Map type to Env Vars
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
  }

  if (!user || !pass) {
    console.warn(`Missing credentials for email type: ${type}`);
    return null;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  transporters[type] = transporter;
  return transporter;
}

export async function sendEmail({ to, subject, html, type = "support" }: EmailOptions) {
  const transporter = getTransporter(type);
  if (!transporter) return;

  // Get From Address
  let from;
  switch (type) {
    case "support": from = process.env.SMTP_SUPPORT_FROM; break;
    case "alerts": from = process.env.SMTP_ALERTS_FROM; break;
    case "marketing": from = process.env.SMTP_MARKETING_FROM; break;
  }

  try {
    await transporter.sendMail({
      from: from || process.env.SMTP_FROM_DEFAULT, // Fallback
      to,
      subject,
      html,
    });
    console.log(`📧 Sent (${type}) to ${to}: ${subject}`);
  } catch (error) {
    console.error(`❌ Email failed (${type}):`, error);
  }
}
