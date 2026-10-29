import type { APIRoute } from "astro";
import { SECTION_CONTACTS } from "@/constants/contacts";
import { giustificaFormSchema } from "@/lib/utils/services";

export const prerender = false;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.json().catch(() => null);

    if (!rawBody || typeof rawBody !== "object") {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Formato della richiesta non valido.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const parsed = giustificaFormSchema.safeParse(rawBody);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }

      return new Response(
        JSON.stringify({
          ok: false,
          error:
            "Alcuni campi obbligatori non sono compilati correttamente. Verifica i dati inseriti.",
          fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const data = parsed.data;
    const recipientEmail = SECTION_CONTACTS.emails.giustificazioniRto;
    const submittedAt = new Date().toISOString();

    const htmlSummary = `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 640px;">
        <h2 style="color: #004b97; margin-bottom: 8px;">Giustificazione Assenza R.T.O. - AIA Sezione di Agrigento</h2>
        <p style="margin-top: 0; color: #334155;">Ricevuta nuova comunicazione di assenza alla Riunione Tecnica Obbligatoria:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Associato:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(data.cognome)} ${escapeHtml(data.nome)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email Sinfonia4You:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(data.email)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Cod. Meccanografico:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(data.meccanografico)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Tessera Federale N.:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(data.numeroTessera)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Luogo e Data di Nascita:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(data.luogoNascita)} (${escapeHtml(data.dataNascita)})</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Riunione Tecnica:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(data.evento)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Motivazione Assenza:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(data.motivo)}</td></tr>
        </table>
      </div>
    `.trim();

    const resendApiKey = import.meta.env.RESEND_API_KEY;
    if (resendApiKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "AIA Sezione di Agrigento <noreply@aiaagrigento.it>",
          to: [recipientEmail],
          cc: [data.email],
          reply_to: data.email,
          subject: `[Giustificazione RTO] ${data.cognome} ${data.nome} - ${data.evento}`,
          html: htmlSummary,
        }),
      }).catch(() => null);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message:
          "Giustificazione registrata con successo. Una copia di riepilogo è stata inviata al tuo indirizzo email.",
        recipient: recipientEmail,
        submittedAt,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch {
    return new Response(
      JSON.stringify({
        ok: false,
        error:
          "Si è verificato un problema durante la registrazione della giustificazione. Riprova tra qualche istante.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
