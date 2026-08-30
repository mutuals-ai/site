import { siteHost, siteUrl } from "@/lib/site";
/**
 * Confirmation email via Resend. No-op (with a console.info) when
 * RESEND_API_KEY is not set, so signup works end-to-end without keys.
 * Never throws — failures are caught and logged.
 */
import { Resend } from "resend";
import { formatPosition } from "./waitlist";

export interface SendConfirmationInput {
  to: string;
  position: number;
  referralCode: string;
}

function renderText({ position, referralCode }: SendConfirmationInput): string {
  const pos = formatPosition(position);
  return [
    `You're #${pos} on the Mutuals list.`,
    `We'll message you when your spot opens.`,
    ``,
    `Move up the list: each friend who joins moves you up 10 spots.`,
    `${siteHost()}/?r=${referralCode}`,
  ].join("\n");
}

function renderHtml({ position, referralCode }: SendConfirmationInput): string {
  const pos = formatPosition(position);
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0E0C0B;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0E0C0B;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#1A1715;border:1px solid #2A2623;border-radius:12px;padding:24px;font-family:'JetBrains Mono','Geist Mono',ui-monospace,SFMono-Regular,Menlo,monospace;color:#F2EDE4;">
            <tr>
              <td style="font-size:15px;line-height:1.6;">
                <div style="color:#2F7FD6;">&#10003; You're on the list &middot; #${pos}</div>
                <div style="margin-top:12px;">We'll message you when your spot opens.</div>
                <div style="margin-top:20px;color:#A8A39B;">
                  Move up the list: each friend who joins moves you up 10 spots.<br />
                  <a href="${siteUrl()}/?r=${referralCode}" style="color:#2F7FD6;">${siteHost()}/?r=${referralCode}</a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendConfirmation(input: SendConfirmationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info("[waitlist] RESEND_API_KEY missing — skipping confirmation email");
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const from = process.env.EMAIL_FROM || "Mutuals <hello@getmutuals.ai>";
    await resend.emails.send({
      from,
      to: input.to,
      subject: `You're #${formatPosition(input.position)} on the Mutuals list`,
      text: renderText(input),
      html: renderHtml(input),
    });
  } catch (err) {
    console.error("[waitlist] failed to send confirmation email", err);
  }
}
