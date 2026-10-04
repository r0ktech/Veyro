import "server-only";

type Email = { to: string; subject: string; html: string; text: string };

/**
 * Sends an email through the Mailgun HTTP API.
 * Docs: https://documentation.mailgun.com/docs/mailgun/api-reference/send/mailgun/messages
 */
export async function sendEmail({ to, subject, html, text }: Email) {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  if (!apiKey || !domain) {
    throw new Error("Mailgun is not configured: set MAILGUN_API_KEY and MAILGUN_DOMAIN");
  }
  // EU-region domains must use https://api.eu.mailgun.net
  const baseUrl = process.env.MAILGUN_API_URL || "https://api.mailgun.net";
  const from = process.env.MAILGUN_FROM || `Veyro <orders@${domain}>`;

  const body = new URLSearchParams({ from, to, subject, html, text });
  const res = await fetch(`${baseUrl}/v3/${domain}/messages`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`api:${apiKey}`).toString("base64") },
    body,
  });

  if (!res.ok) {
    throw new Error(`Mailgun ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as { id: string; message: string };
}
