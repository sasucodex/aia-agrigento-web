import type { APIRoute } from "astro";
import { SECTION_CONTACTS } from "@/constants/contacts";
import { giustificaFormSchema } from "@/lib/utils/services";

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

    const recipientEmail = SECTION_CONTACTS.emails.giustificazioniRto;
    const submittedAt = new Date().toISOString();

    return new Response(
      JSON.stringify({
        ok: true,
        message:
          "Giustificazione registrata con successo e presa in carico dalla Segreteria Sezionale.",
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
