export const styles = `
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .header { background: linear-gradient(135deg, #06b6d4 0%, #4f46e5 100%); padding: 30px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
  .content { padding: 40px 30px; }
  .btn { display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }
  .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
  .highlight { color: #4f46e5; font-weight: bold; }
`;

export const verifyEmailTemplate = (url: string) => `
<!DOCTYPE html>
<html>
<head><style>${styles}</style></head>
<body>
  <div class="container">
    <div class="header"><h1>Welcome to Horizon</h1></div>
    <div class="content">
      <h2>Verify your email address</h2>
      <p>Thanks for joining <strong>Horizon Alerts</strong>. To access the institutional dashboard and start receiving real-time order flow signals, please verify your email.</p>
      <center><a href="${url}" class="btn">Verify Email Access</a></center>
      <p style="margin-top: 30px; font-size: 13px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Horizon Services. Institutional Order Flow.</div>
  </div>
</body>
</html>
`;

export const welcomeTemplate = (name: string) => {
  const base = process.env.PUBLIC_SITE_URL || "https://horizonsvc.com";
  return `
<!DOCTYPE html>
<html>
<head><style>${styles}</style></head>
<body>
  <div class="container">
    <div class="header"><h1>Access Granted</h1></div>
    <div class="content">
      <h2>Welcome aboard, ${name}.</h2>
      <p>Your email is verified, and your dashboard is unlocked. You now have access to:</p>
      <ul>
        <li>Real-time Institutional Signals</li>
        <li>The Academy Learning Modules</li>
        <li>Pro Screener Tools</li>
      </ul>
      <p>We are thrilled to have you with us on this journey to decode the market.</p>
      <center><a href="${base}/dashboard" class="btn">Launch Terminal</a></center>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Horizon Services.</div>
  </div>
</body>
</html>
`;
};

export const contactConfirmationTemplate = (name: string, message: string) => `
<!DOCTYPE html>
<html>
<head><style>${styles}</style></head>
<body>
  <div class="container">
    <div class="header"><h1>Message Received</h1></div>
    <div class="content">
      <h2>Hello ${name},</h2>
      <p>Thank you for contacting Horizon Support. We have received your message and a member of our team will review it shortly.</p>
      <div style="background: #f3f4f6; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0;">
        <strong>Your Message:</strong><br/>
        <em style="color: #555;">"${message}"</em>
      </div>
      <p>Our typical response time is under 24 hours.</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Horizon Services.</div>
  </div>
</body>
</html>
`;

export const ticketTemplate = (ticketId: string, topic: string, message: string) => `
<!DOCTYPE html>
<html>
<head><style>${styles}</style></head>
<body>
  <div class="container">
    <div class="header"><h1>Support Ticket #${ticketId}</h1></div>
    <div class="content">
      <h2>Topic: ${topic}</h2>
      <p>We have logged your support request. Our engineering team has been notified.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p>${message}</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p>You can reply directly to this email to add more information.</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Horizon Services.</div>
  </div>
</body>
</html>
`;

export const securityAlertTemplate = (action: string) => `
<!DOCTYPE html>
<html>
<head><style>${styles}</style></head>
<body>
  <div class="container">
    <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);"><h1>Security Alert</h1></div>
    <div class="content">
      <h2>Account Update: ${action}</h2>
      <p>We noticed a change to your account settings (${action}).</p>
      <p>If this was you, no further action is needed.</p>
      <p class="highlight">If you did not make this change, please contact support immediately.</p>
    </div>
    <div class="footer">&copy; ${new Date().getFullYear()} Horizon Services.</div>
  </div>
</body>
</html>
`;
