import { SECTION_CONTACTS } from "@/constants/contacts";
import type { CourseRegistrationPayload } from "@/types/course";
import {
  EMAIL_NOREPLY_ADDRESS,
  EMAIL_SENDER,
  formatIsoDateToItalianShort,
  renderBaseEmail,
  type EmailSummaryRow,
  type PreparedEmailMessage,
} from "@/lib/emails/baseLayout";

function buildCourseSummaryRows(
  data: CourseRegistrationPayload,
): EmailSummaryRow[] {
  return [
    { label: "Cognome", value: data.cognome },
    { label: "Nome", value: data.nome },
    { label: "Comune di residenza", value: data.citta },
    {
      label: "Data di nascita",
      value: formatIsoDateToItalianShort(data.dataNascita),
    },
    { label: "Telefono / Cellulare", value: data.telefono },
    { label: "Indirizzo Email", value: data.email },
  ];
}

export function buildCourseUserConfirmationEmail(
  data: CourseRegistrationPayload,
): PreparedEmailMessage {
  const rendered = renderBaseEmail({
    subject: "Conferma ricezione candidatura al Corso Arbitri – AIA Agrigento",
    introParagraphs: [
      `Gentile ${data.nome},`,
      "Grazie per aver scelto di metterti in gioco e di entrare nel mondo dell'arbitraggio. La tua richiesta di iscrizione al prossimo Corso Arbitri Nazionale gratuito è stata presa in carico dalla nostra Sezione.",
      "Un responsabile del Corso ti contatterà presto.",
    ],
    summaryHeading: "Ecco un riepilogo dei dati inviati:",
    summaryRows: buildCourseSummaryRows(data),
    signatureGreeting: "A presto e benvenuto nella nostra squadra!",
    signatureOrganization: "Sezione AIA di Agrigento",
  });

  return {
    from: EMAIL_SENDER,
    to: data.email,
    replyTo: EMAIL_NOREPLY_ADDRESS,
    ...rendered,
  };
}

export function buildCourseSectionNotificationEmail(
  data: CourseRegistrationPayload,
): PreparedEmailMessage {
  const rendered = renderBaseEmail({
    subject: `${data.cognome} ${data.nome} – Iscrizione Corso Arbitri`,
    introParagraphs: [
      "È stata ricevuta una nuova iscrizione al Corso Arbitri dal portale web.",
    ],
    summaryHeading: "Ecco il riepilogo dei dati inviati:",
    summaryRows: buildCourseSummaryRows(data),
  });

  return {
    from: EMAIL_SENDER,
    to: SECTION_CONTACTS.emails.corsoArbitri,
    replyTo: data.email,
    ...rendered,
  };
}
