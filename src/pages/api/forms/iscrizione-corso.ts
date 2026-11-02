import type { APIRoute } from "astro";
import { SECTION_CONTACTS } from "@/constants/contacts";
import { CourseRegistrationSchema } from "@/lib/utils/course";

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

    const parsed = CourseRegistrationSchema.safeParse(rawBody);

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
    const recipientEmail = SECTION_CONTACTS.emails.corsoArbitri;
    const submittedAt = new Date().toISOString();

    const htmlSummary = `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 640px;">
        <h2 style="color: #004b97; margin-bottom: 8px;">Nuova Domanda di Iscrizione al Corso Arbitri - AIA Agrigento</h2>
        <p style="margin-top: 0; color: #334155;">Ricevuta nuova candidatura online dalla pagina Diventa Arbitro:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Candidato:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(data.nome)} ${escapeHtml(data.cognome)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Comune di Residenza:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(data.citta)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Data di Nascita:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(data.dataNascita)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Telefono / Cellulare:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(data.telefono)}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Indirizzo Email:</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${escapeHtml(data.email)}</td></tr>
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
          subject: `[Corso Arbitri] Nuova Iscrizione: ${data.cognome} ${data.nome} (${data.citta})`,
          html: htmlSummary,
        }),
      }).catch(() => null);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message:
          "Iscrizione inviata con successo! Un responsabile del Corso Arbitri della Sezione di Agrigento ti contatterà al numero indicato per confermare la tua iscrizione e indicarti la data del primo incontro in sede.",
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
          "Si è verificato un problema durante l'invio dell'iscrizione. Riprova tra qualche istante o contattaci su WhatsApp.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
