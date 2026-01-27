import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY || "";
const fromEmail = process.env.SENDGRID_FROM_EMAIL || "support@horizonsvc.com";

export function sendgridConfigured() {
  return Boolean(apiKey);
}

export function configureSendgrid() {
  if (apiKey) {
    sgMail.setApiKey(apiKey);
  }
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!apiKey) {
    return;
  }

  await sgMail.send({
    to,
    from: fromEmail,
    subject,
    html
  });
}
