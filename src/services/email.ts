import type { Env, ConversationMessage } from "../types";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via Resend API.
 */
async function sendEmail(env: Env, params: SendEmailParams): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Savi Bot <bot@savibm.com>",
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend send failed:", err);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

/**
 * Send lead notification email to Gokul with full conversation context.
 */
export async function sendLeadNotification(
  env: Env,
  params: {
    phone: string;
    email: string;
    companyUrl?: string | null;
    scopeSummary?: string | null;
    messages: ConversationMessage[];
  },
): Promise<boolean> {
  const transcript = params.messages
    .map(
      (m) =>
        `<p><strong>${m.role === "user" ? "Prospect" : "Savi Bot"}:</strong> ${escapeHtml(m.content)}</p>`,
    )
    .join("\n");

  const html = `
    <h2>New Lead from Savi WhatsApp Bot</h2>
    <table style="border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Phone:</td><td>${escapeHtml(params.phone)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Email:</td><td>${escapeHtml(params.email)}</td></tr>
      ${params.companyUrl ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;">Website:</td><td><a href="${escapeHtml(params.companyUrl)}">${escapeHtml(params.companyUrl)}</a></td></tr>` : ""}
    </table>
    ${params.scopeSummary ? `<h3>Scope Summary</h3><pre style="background:#f5f5f5;padding:16px;border-radius:8px;white-space:pre-wrap;">${escapeHtml(params.scopeSummary)}</pre>` : ""}
    <h3>Full Conversation</h3>
    <div style="background:#f9f9f9;padding:16px;border-radius:8px;">
      ${transcript}
    </div>
    <p style="margin-top:24px;color:#666;">Reply to this email to start your proposal.</p>
  `;

  return sendEmail(env, {
    to: env.NOTIFICATION_EMAIL,
    subject: `New Lead: ${params.email} (${params.phone})`,
    html,
  });
}

/**
 * Send human escalation notification to Gokul.
 */
export async function sendHumanEscalation(
  env: Env,
  params: {
    phone: string;
    messages: ConversationMessage[];
  },
): Promise<boolean> {
  const transcript = params.messages
    .map(
      (m) =>
        `<p><strong>${m.role === "user" ? "Prospect" : "Savi Bot"}:</strong> ${escapeHtml(m.content)}</p>`,
    )
    .join("\n");

  const html = `
    <h2>Human Escalation Requested</h2>
    <p><strong>Phone:</strong> ${escapeHtml(params.phone)}</p>
    <p style="color:#cc0000;font-weight:bold;">The prospect requested to speak with a human.</p>
    <h3>Full Conversation</h3>
    <div style="background:#f9f9f9;padding:16px;border-radius:8px;">
      ${transcript}
    </div>
    <p style="margin-top:24px;color:#666;">Please reach out to this prospect on WhatsApp.</p>
  `;

  return sendEmail(env, {
    to: env.NOTIFICATION_EMAIL,
    subject: `HUMAN ESCALATION: ${params.phone}`,
    html,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
