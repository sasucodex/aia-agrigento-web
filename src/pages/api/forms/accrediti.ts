import type { APIRoute } from "astro";
import { SECTION_CONTACTS } from "@/constants/contacts";
import {
  isHoneypotTriggered,
  sendFormDualEmails,
  SMTP_ERROR_USER_MESSAGE,
} from "@/lib/emails/mailer";
import {
  buildAccreditoSectionNotificationEmail,
  buildAccreditoUserConfirmationEmail,
} from "@/lib/emails/matchAccreditation";
import { accreditoFormSchema } from "@/lib/utils/services";

export const prerender = false;

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

    if (isHoneypotTriggered(rawBody as Record<string, unknown>)) {
      return new Response(
        JSON.stringify({
          ok: true,
          message:
            "Richiesta di accredito presa in carico e trasmessa a accrediti@aiaagrigento.it. L'eventuale conferma sarà comunicata via email nel rispetto dell'ordine di ricezione e della disponibilità della società ospitante.",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const parsed = accreditoFormSchema.safeParse(rawBody);

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
    const userConfirmation = buildAccreditoUserConfirmationEmail(data);
    const sectionNotification = buildAccreditoSectionNotificationEmail(data);

    await sendFormDualEmails({
      userConfirmation,
      sectionNotification,
    });

    const recipientEmail = SECTION_CONTACTS.emails.accrediti;
    const submittedAt = new Date().toISOString();

    return new Response(
      JSON.stringify({
        ok: true,
        message:
          "Richiesta di accredito presa in carico e trasmessa a accrediti@aiaagrigento.it. L'eventuale conferma sarà comunicata via email nel rispetto dell'ordine di ricezione e della disponibilità della società ospitante.",
        recipient: recipientEmail,
        submittedAt,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[API /api/forms/accrediti] Errore invio SMTP:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: SMTP_ERROR_USER_MESSAGE,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
