import { SECTION_CONTACTS } from "@/constants/contacts";
import type { AccreditoFormPayload } from "@/types/services";
import {
  EMAIL_NOREPLY_ADDRESS,
  EMAIL_SENDER,
  formatIsoDateToItalianShort,
  renderBaseEmail,
  type EmailSummaryRow,
  type PreparedEmailMessage,
} from "@/lib/emails/baseLayout";

function buildAccreditoSummaryRows(
  data: AccreditoFormPayload,
): EmailSummaryRow[] {
  const formattedBirthDate = formatIsoDateToItalianShort(data.dataNascita);
  const cleanedNotes = data.note?.trim();

  return [
    { label: "Cognome", value: data.cognome },
    { label: "Nome", value: data.nome },
    { label: "Email Sinfonia4You", value: data.email },
    { label: "Codice Meccanografico", value: data.meccanografico },
    { label: "Tessera Federale N.", value: data.numeroTessera },
    {
      label: "Luogo e Data di Nascita",
      value: `${data.luogoNascita} (${formattedBirthDate})`,
    },
    { label: "Gara Richiesta", value: data.partita },
    {
      label: "Note",
      value:
        cleanedNotes && cleanedNotes.length > 0
          ? cleanedNotes
          : "Nessuna nota inserita",
    },
  ];
}

export function buildAccreditoUserConfirmationEmail(
  data: AccreditoFormPayload,
): PreparedEmailMessage {
  const rendered = renderBaseEmail({
    subject: `Conferma ricezione richiesta accredito: ${data.partita} – AIA Agrigento`,
    introParagraphs: [
      `Gentile ${data.nome},`,
      `La tua richiesta di accredito per la gara ${data.partita} è stata correttamente acquisita dai sistemi informatici della Sezione.`,
    ],
    summaryHeading: "Ecco un riepilogo dei dati inviati:",
    summaryRows: buildAccreditoSummaryRows(data),
    bulletNotes: [
      "L'accredito è subordinato al numero di posti riservati all'AIA dalla società ospitante e all'ordine cronologico di ricezione delle richieste.",
      "L'eventuale concessione del biglietto ti verrà confermata dalla segreteria.",
      "Il ritiro del tagliando avverrà al botteghino/varco accrediti dello stadio almeno 60 minuti prima dell'inizio della gara, esibendo obbligatoriamente un documento d'identità in corso di validità e la Tessera Federale originale vidimata.",
    ],
    signatureGreeting: "Cordiali saluti,",
    signatureOrganization: "Sezione AIA di Agrigento",
  });

  return {
    from: EMAIL_SENDER,
    to: data.email,
    replyTo: EMAIL_NOREPLY_ADDRESS,
    ...rendered,
  };
}

export function buildAccreditoSectionNotificationEmail(
  data: AccreditoFormPayload,
): PreparedEmailMessage {
  const rendered = renderBaseEmail({
    subject: `${data.cognome} ${data.nome} – Richiesta Accredito: ${data.partita}`,
    introParagraphs: [
      `È stata ricevuta una richiesta di accredito per la gara ${data.partita}.`,
    ],
    summaryHeading: "Ecco il riepilogo dei dati inviati:",
    summaryRows: buildAccreditoSummaryRows(data),
  });

  return {
    from: EMAIL_SENDER,
    to: SECTION_CONTACTS.emails.accrediti,
    replyTo: data.email,
    ...rendered,
  };
}
