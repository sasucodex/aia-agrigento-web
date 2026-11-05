import { SECTION_CONTACTS } from "@/constants/contacts";
import type { GiustificaFormPayload } from "@/types/services";
import {
  EMAIL_NOREPLY_ADDRESS,
  EMAIL_SENDER,
  formatIsoDateToItalianShort,
  renderBaseEmail,
  type EmailSummaryRow,
  type PreparedEmailMessage,
} from "@/lib/emails/baseLayout";

function buildRTOSummaryRows(data: GiustificaFormPayload): EmailSummaryRow[] {
  const formattedBirthDate = formatIsoDateToItalianShort(data.dataNascita);

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
    { label: "Riunione Tecnica", value: data.evento },
    { label: "Motivazione", value: data.motivo },
  ];
}

export function buildRTOUserConfirmationEmail(
  data: GiustificaFormPayload,
): PreparedEmailMessage {
  const rendered = renderBaseEmail({
    subject: `Conferma ricezione giustificazione RTO: ${data.evento} – AIA Agrigento`,
    introParagraphs: [
      `Gentile ${data.nome},`,
      `Ti confermiamo che la tua giustificazione di assenza per la Riunione Tecnica Obbligatoria del ${data.evento} è stata correttamente acquisita dai sistemi informatici della Sezione.`,
    ],
    summaryHeading: "Ecco un riepilogo dei dati inviati:",
    summaryRows: buildRTOSummaryRows(data),
    outroParagraphs: [
      "La presente comunicazione attesta la ricezione della giustificazione nei termini previsti. La valutazione della motivazione resta di competenza del Consiglio Direttivo Sezionale ai sensi del Regolamento Associativo AIA.",
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

export function buildRTOSectionNotificationEmail(
  data: GiustificaFormPayload,
): PreparedEmailMessage {
  const rendered = renderBaseEmail({
    subject: `${data.cognome} ${data.nome} – Giustificazione RTO del ${data.evento}`,
    introParagraphs: [
      `È stata ricevuta una comunicazione di giustificazione assenza per la Riunione Tecnica Obbligatoria del ${data.evento}.`,
    ],
    summaryHeading: "Ecco il riepilogo dei dati inviati:",
    summaryRows: buildRTOSummaryRows(data),
  });

  return {
    from: EMAIL_SENDER,
    to: SECTION_CONTACTS.emails.giustificazioniRto,
    replyTo: data.email,
    ...rendered,
  };
}
