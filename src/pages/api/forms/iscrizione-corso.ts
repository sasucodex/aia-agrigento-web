import type { APIRoute } from "astro";
import { SECTION_CONTACTS } from "@/constants/contacts";
import { CourseRegistrationSchema } from "@/lib/utils/course";

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

    const recipientEmail = SECTION_CONTACTS.emails.corsoArbitri;
    const submittedAt = new Date().toISOString();

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
