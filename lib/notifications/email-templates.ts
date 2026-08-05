// The SMS spec (Dabira_SMS_Implementation_Spec.pdf) gives exact,
// owner-approved SMS copy and the subject lines these emails MUST use
// (the SMS bodies reference them verbatim). It does not include the
// original email body copy, so the bodies below are a professional
// draft — review in the admin Content section before relying on them
// for anything legally/financially sensitive.
//
// If a subject line below ever changes, the corresponding SMS template
// in sms-templates.ts must be updated to match (spec's explicit note).

const BRAND_COLOR = "#2f6f64";

function baseLayout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f5f3;font-family:Georgia,'Times New Roman',serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f3;padding:32px 0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr><td style="background:${BRAND_COLOR};padding:24px 32px;">
            <span style="color:#ffffff;font-size:20px;font-weight:600;">Dabira Projects</span>
          </td></tr>
          <tr><td style="padding:32px;color:#222222;font-size:15px;line-height:1.6;">
            ${bodyHtml}
          </td></tr>
          <tr><td style="padding:20px 32px;background:#f6f5f3;color:#888888;font-size:12px;line-height:1.5;">
            Dabira Projects &middot; NYC &middot; ${title}<br />
            Questions? Reply to this email or contact projectassistance@dabira.org.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

export type EmailTemplate = { subject: string; html: string; text: string };

export function applicationEmail(params: {
  firstName: string;
  applicationLink: string;
  compensationUsd: number;
}): EmailTemplate {
  const subject = "You qualify — Wristband Research Study Guide & Application";
  const html = baseLayout(
    subject,
    `<p>Hi ${params.firstName},</p>
     <p>Good news — you qualify for the Wristband Research Study. This is a paid, in-person session at a
     professional NYC research facility (~3 hrs &amp; 15 mins), compensated at <strong>$${params.compensationUsd}</strong>,
     credited the same day upon completion.</p>
     <p><strong>Please read this email fully before applying</strong> — the application below is time-sensitive and spots are limited.</p>
     <p style="text-align:center;margin:28px 0;">
       <a href="${params.applicationLink}" style="background:${BRAND_COLOR};color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">
         Complete your application
       </a>
     </p>
     <p>After applying, keep a close eye on your email (and spam folder) — if the research team reaches out, please
     respond promptly and complete whatever is requested to keep your spot.</p>
     <p>— The Dabira Projects Team</p>`
  );
  const text = `Hi ${params.firstName},\n\nYou qualify for the Wristband Research Study ($${params.compensationUsd}, ~3 hrs & 15 mins, same-day payout). Complete your application here: ${params.applicationLink}\n\nRead the email fully before applying — spots are limited. After applying, watch your email/spam closely and respond promptly to any follow-up from the research team.\n\n— Dabira Projects`;
  return { subject, html, text };
}

export function waitlistSpotsFullEmail(params: {
  firstName: string;
  selectMonthLink: string;
}): EmailTemplate {
  const subject =
    "You Pre-Qualify for the Wristband Research Study — Spots Are Currently Full";
  const html = baseLayout(
    subject,
    `<p>Hi ${params.firstName},</p>
     <p>You pre-qualify for the Wristband Research Study ($200) — but the month you originally selected is
     currently full.</p>
     <p>You're on our waitlist. Use the link below to pick a month and part of the month that works for you,
     and we'll notify you as soon as a spot opens up.</p>
     <p style="text-align:center;margin:28px 0;">
       <a href="${params.selectMonthLink}" style="background:${BRAND_COLOR};color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">
         Select your month
       </a>
     </p>
     <p>— The Dabira Projects Team</p>`
  );
  const text = `Hi ${params.firstName},\n\nYou pre-qualify for the Wristband Research Study ($200) but your selected month is currently full. Pick a new month here: ${params.selectMonthLink}\n\n— Dabira Projects`;
  return { subject, html, text };
}

export function waitlistConfirmationEmail(params: {
  firstName: string;
}): EmailTemplate {
  const subject = "You're on the Dabira Projects waitlist";
  const html = baseLayout(
    subject,
    `<p>Hi ${params.firstName},</p>
     <p>Thanks for joining the waitlist for a Dabira Projects study. We'll email you as soon as a spot opens
     up for the month you selected.</p>
     <p>— The Dabira Projects Team</p>`
  );
  const text = `Hi ${params.firstName},\n\nThanks for joining the Dabira Projects waitlist. We'll email you as soon as a spot opens up.\n\n— Dabira Projects`;
  return { subject, html, text };
}
