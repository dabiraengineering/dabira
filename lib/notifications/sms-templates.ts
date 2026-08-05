// Fixed copy from Dabira_SMS_Implementation_Spec.pdf (v2, 2026-07-15) —
// only bracketed fields are dynamic. Do not reword without checking with
// the business owner; these exact subject-line references are load-bearing
// (see the matching email templates).

export function smsImmediate(firstName: string): string {
  return (
    `Hi ${firstName}, it's Dabira Projects. We just emailed your official Wristband Study application ($200). ` +
    `Look for "You qualify — Wristband Research Study Guide & Application" and kindly check spam if not found in your primary inbox. ` +
    `Please read the email thoroughly as it's detailed before applying, then complete the application as soon as possible — space is limited. ` +
    `After applying, keep a close eye on your email and spam. Any email you receive from the research team — please respond promptly and complete whatever is requested.`
  );
}

export function smsReminder(
  firstName: string,
  month: string,
  half: "First" | "Second"
): string {
  return (
    `Hi ${firstName}, it's Dabira Projects. You selected ${month} — ${half} half and your window is almost here. ` +
    `We're sending your official Wristband Study application ($200) by email this week. ` +
    `Please be on the lookout for "You qualify — Wristband Research Study Guide & Application" and kindly check spam if not found in your primary inbox.`
  );
}

export function smsDelivery(firstName: string): string {
  return (
    `Hi ${firstName}, it's Dabira Projects — your Wristband Study application was just sent. ` +
    `Open "You qualify — Wristband Research Study Guide & Application" and kindly check spam if not found in your primary inbox. ` +
    `Please read the email thoroughly as it's detailed before applying, then complete the application as soon as possible — space is limited. ` +
    `After applying, keep a close eye on your email and spam. Any email you receive from the research team — please respond promptly and complete whatever is requested.`
  );
}

export function smsNoMonthNudge(firstName: string): string {
  return (
    `Hi ${firstName}, it's Dabira Projects. You pre-qualified for the Wristband Study ($200), but the month you chose was full, ` +
    `so you're not yet assigned to a month. Please open the email "You Pre-Qualify for the Wristband Research Study — Spots Are Currently Full" ` +
    `and use the link inside to select a month and part of the month that works for you. Kindly check spam if not found in your primary inbox.`
  );
}
