export const EMAIL_SENDER =
  "AIA Sezione di Agrigento <noreply@aiaagrigento.it>";
export const EMAIL_NOREPLY_ADDRESS = "noreply@aiaagrigento.it";
export const PRIVACY_POLICY_URL = "https://aiaagrigento.it/privacy";

export interface EmailSummaryRow {
  label: string;
  value: string;
}

export interface BaseEmailTemplateOptions {
  subject: string;
  introParagraphs: string[];
  summaryHeading: string;
  summaryRows: EmailSummaryRow[];
  bulletNotes?: string[];
  outroParagraphs?: string[];
  signatureGreeting?: string;
  signatureOrganization?: string;
}

export interface RenderedEmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface PreparedEmailMessage extends RenderedEmailContent {
  from: string;
  to: string;
  replyTo: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatIsoDateToItalianShort(dateString: string): string {
  const trimmed = dateString.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return trimmed;
  }
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export function renderBaseEmail(
  options: BaseEmailTemplateOptions,
): RenderedEmailContent {
  const {
    subject,
    introParagraphs,
    summaryHeading,
    summaryRows,
    bulletNotes = [],
    outroParagraphs = [],
    signatureGreeting,
    signatureOrganization,
  } = options;

  const introHtml = introParagraphs
    .map(
      (paragraph) =>
        `<p style="margin: 0 0 14px 0; font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #334155;">${escapeHtml(paragraph)}</p>`,
    )
    .join("\n");

  const summaryItemsHtml = summaryRows
    .map(
      (row) =>
        `<tr>
          <td style="padding: 6px 0; font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #334155; vertical-align: top;">
            &bull; <strong style="color: #0f172a; font-weight: 700;">${escapeHtml(row.label)}:</strong> ${escapeHtml(row.value)}
          </td>
        </tr>`,
    )
    .join("\n");

  const bulletNotesHtml =
    bulletNotes.length > 0
      ? `<div style="margin: 20px 0 0 0; padding: 14px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 2px;">
          ${bulletNotes
            .map(
              (note) =>
                `<p style="margin: 0 0 8px 0; font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.55; color: #334155;">&bull; ${escapeHtml(note)}</p>`,
            )
            .join("\n")}
        </div>`
      : "";

  const outroHtml =
    outroParagraphs.length > 0
      ? `<div style="margin: 20px 0 0 0;">
          ${outroParagraphs
            .map(
              (paragraph) =>
                `<p style="margin: 0 0 12px 0; font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #334155;">${escapeHtml(paragraph)}</p>`,
            )
            .join("\n")}
        </div>`
      : "";

  const signatureHtml =
    signatureGreeting || signatureOrganization
      ? `<div style="margin: 22px 0 0 0; padding-top: 14px; border-top: 1px solid #f1f5f9;">
          ${
            signatureGreeting
              ? `<p style="margin: 0 0 2px 0; font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.5; color: #334155;">${escapeHtml(signatureGreeting)}</p>`
              : ""
          }
          ${
            signatureOrganization
              ? `<p style="margin: 0; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.5; font-weight: 700; color: #0f172a;">${escapeHtml(signatureOrganization)}</p>`
              : ""
          }
        </div>`
      : "";

  const html = `<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin: 0; padding: 24px 12px; background-color: #f8fafc; font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-collapse: collapse;">
      <tr>
        <td style="background-color: #004b97; padding: 20px 24px; border-bottom: 3px solid #caa866;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
            <tr>
              <td width="60" style="width: 60px; vertical-align: middle; padding-right: 14px;">
                <img
                  src="cid:logo-aia-agrigento"
                  alt="AIA Sezione di Agrigento"
                  width="54"
                  height="54"
                  style="display: block; width: 54px; height: 54px; border: 0; outline: none; border-radius: 50%;"
                />
              </td>
              <td style="vertical-align: middle;">
                <p style="margin: 0; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; color: #ffffff; line-height: 1.25;">
                  AIA SEZIONE DI AGRIGENTO
                </p>
                <p style="margin: 3px 0 0 0; font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 400; letter-spacing: 0.02em; color: #dbeafe; line-height: 1.3;">
                  Federazione Italiana Giuoco Calcio
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 28px; background-color: #ffffff;">
          ${introHtml}
          <div style="margin: 20px 0 0 0; padding: 16px 18px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 2px;">
            <p style="margin: 0 0 10px 0; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #0f172a;">
              ${escapeHtml(summaryHeading)}
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: collapse;">
              ${summaryItemsHtml}
            </table>
          </div>
          ${bulletNotesHtml}
          ${outroHtml}
          ${signatureHtml}
        </td>
      </tr>
      <tr>
        <td style="padding: 18px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; color: #64748b;">
          <p style="margin: 0 0 8px 0; font-style: italic; color: #64748b;">
            Questa email è generata automaticamente, per favore non rispondere
          </p>
          <p style="margin: 0; color: #64748b;">
            Associazione Italiana Arbitri &middot; Sezione di Agrigento<br />
            Via Matteo Cimarra, 38 &ndash; 92100 Agrigento (AG) &middot;
            <a href="${PRIVACY_POLICY_URL}" style="color: #004b97; text-decoration: underline;">Informativa sulla Privacy</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textSections: string[] = [];

  for (const paragraph of introParagraphs) {
    textSections.push(paragraph);
  }

  const summaryLines = [
    summaryHeading,
    ...summaryRows.map((row) => `• ${row.label}: ${row.value}`),
  ];
  textSections.push(summaryLines.join("\n"));

  if (bulletNotes.length > 0) {
    textSections.push(bulletNotes.map((note) => `• ${note}`).join("\n"));
  }

  for (const paragraph of outroParagraphs) {
    textSections.push(paragraph);
  }

  if (signatureGreeting || signatureOrganization) {
    const sigLines = [signatureGreeting, signatureOrganization].filter(Boolean);
    textSections.push(sigLines.join("\n"));
  }

  textSections.push(
    [
      "---",
      "Questa email è generata automaticamente, per favore non rispondere",
      "Associazione Italiana Arbitri · Sezione di Agrigento · Via Matteo Cimarra, 38 – 92100 Agrigento (AG)",
      `Informativa sulla Privacy: ${PRIVACY_POLICY_URL}`,
    ].join("\n"),
  );

  return {
    subject,
    html,
    text: textSections.join("\n\n"),
  };
}
