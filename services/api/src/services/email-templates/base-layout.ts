import type { BaseLayoutOptions, HeaderStyle } from "./types.js";

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export { escapeHtml };

const GRADIENTS: Record<HeaderStyle, string> = {
  brand: "background: linear-gradient(135deg, #06b6d4 0%, #4f46e5 100%);",
  security: "background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);",
  success: "background: linear-gradient(135deg, #059669 0%, #047857 100%);",
  warning: "background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);",
};

const YEAR = new Date().getFullYear();

/**
 * Table-based responsive email wrapper (600px, inline CSS).
 * All 24 templates call this single function.
 */
export function baseLayout(opts: BaseLayoutOptions): string {
  const {
    preheader,
    title,
    subtitle,
    headerStyle = "brand",
    body,
    unsubscribeUrl,
  } = opts;

  const gradient = GRADIENTS[headerStyle];
  const safeTitle = escapeHtml(title);
  const safeSubtitle = subtitle ? escapeHtml(subtitle) : "";

  const unsubscribeBlock = unsubscribeUrl
    ? `<tr><td style="padding-top:12px;">
         <a href="${escapeHtml(unsubscribeUrl)}" style="color:#9ca3af;font-size:11px;text-decoration:underline;">Unsubscribe from these emails</a>
       </td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${safeTitle}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preheader (hidden inbox preview text) -->
  <div style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
    ${"&zwnj;&nbsp;".repeat(30)}
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <!-- 600px container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="${gradient} padding:32px 40px; text-align:center;">
              <!-- Logo circle -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="width:48px;height:48px;background-color:rgba(255,255,255,0.2);border-radius:50%;text-align:center;vertical-align:middle;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-1px;">
                    N
                  </td>
                </tr>
              </table>
              <h1 style="margin:16px 0 0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">
                ${safeTitle}
              </h1>
              ${safeSubtitle ? `<p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.85);font-weight:400;">${safeSubtitle}</p>` : ""}
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px;">
              ${body}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f9fafb;padding:28px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="font-size:13px;font-weight:700;color:#374151;padding-bottom:6px;">
                    Nova by Horizon
                  </td>
                </tr>
                <tr>
                  <td style="font-size:12px;color:#9ca3af;line-height:20px;">
                    <a href="https://horizonsvc.com" style="color:#06b6d4;text-decoration:none;">horizonsvc.com</a>
                    &nbsp;&middot;&nbsp;
                    <a href="mailto:support@horizonsvc.com" style="color:#06b6d4;text-decoration:none;">support@horizonsvc.com</a>
                    &nbsp;&middot;&nbsp;
                    <a href="tel:+18643053993" style="color:#06b6d4;text-decoration:none;">+1 864-305-3993</a>
                  </td>
                </tr>
                <tr>
                  <td style="font-size:11px;color:#9ca3af;padding-top:10px;">
                    &copy; ${YEAR} Horizon Services LLC. All rights reserved.
                  </td>
                </tr>
                ${unsubscribeBlock}
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ── Shared helper: CTA button ── */
export function ctaButton(text: string, url: string, color = "#4f46e5"): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto 0;">
  <tr>
    <td style="background-color:${color};border-radius:8px;">
      <a href="${escapeHtml(url)}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
        ${escapeHtml(text)}
      </a>
    </td>
  </tr>
</table>`;
}

/* ── Shared helper: info row for details sections ── */
export function infoRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:8px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;width:140px;vertical-align:top;">${escapeHtml(label)}</td>
  <td style="padding:8px 0;font-size:13px;color:#111827;font-weight:600;border-bottom:1px solid #f3f4f6;">${escapeHtml(value)}</td>
</tr>`;
}

/* ── Shared helper: progress bar ── */
export function progressBar(pct: number, color = "#ef4444"): string {
  const clamped = Math.min(100, Math.max(0, pct));
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:12px 0;">
  <tr>
    <td style="background-color:#e5e7eb;border-radius:6px;height:12px;overflow:hidden;">
      <div style="width:${clamped}%;height:12px;background-color:${color};border-radius:6px;"></div>
    </td>
  </tr>
  <tr>
    <td style="font-size:12px;color:#6b7280;padding-top:4px;text-align:right;">${clamped.toFixed(1)}%</td>
  </tr>
</table>`;
}

/* ── Shared helper: warning box ── */
export function warningBox(text: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:20px 0;">
  <tr>
    <td style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:0 6px 6px 0;">
      <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">${text}</p>
    </td>
  </tr>
</table>`;
}
