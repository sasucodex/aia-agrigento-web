import { z } from "zod";
import rtoCalendarRaw from "@/data/rto-calendar.json";
import { formatDateItalian } from "@/lib/utils/date";
import type {
  FederalPortal,
  RTOCategory,
  RTOEvent,
  RTOSeasonMetadata,
} from "@/types/services";

const rtoCalendarData = rtoCalendarRaw as RTOEvent[];

export const FEDERAL_PORTALS: FederalPortal[] = [
  {
    id: "sinfonia4you",
    kicker: "GESTIONALE OPERATIVO ARBITRI",
    title: "Sinfonia4You — Portale Ufficiale AIA",
    description:
      "Accesso per consultazione designazioni, accettazione gare, anagrafica associativa e rendicontazione rimborsi spesa.",
    ctaLabel: "Accedi a Sinfonia4You",
    url: "https://servizi.aia-figc.it/sinfonia4you/",
    variant: "primary",
  },
  {
    id: "aia-figc-nazionale",
    kicker: "PORTALE ISTITUZIONALE NAZIONALE",
    title: "Portale AIA FIGC Nazionale",
    description:
      "Circolari della presidenza, comunicati ufficiali e aggiornamenti della Commissione Nazionale.",
    ctaLabel: "Visita aia-figc.it",
    url: "https://www.aia-figc.it",
    variant: "secondary",
  },
];

export const RTO_SEASON_METADATA: RTOSeasonMetadata = {
  season: "2026/2027",
  documentDate: "22/08/2026",
  pdfUrl: "/documents/calendario-rto-2025-2026.pdf",
  regulationHeading: "PARTECIPAZIONE OBBLIGATORIA · ART. 40 E 42 REG. AIA",
  regulationArticle: "Art. 40 e Art. 42 del Regolamento A.I.A.",
  regulationText:
    "Gli arbitri sono tenuti a frequentare le riunioni tecniche obbligatorie, giustificando anticipatamente eventuali assenze. Diventa disciplinarmente rilevante la fattispecie di cinque assenze ingiustificate, anche non consecutive, nella medesima stagione sportiva.",
};

export const RTO_FILTER_CATEGORIES: {
  id: "Tutte" | RTOCategory;
  label: string;
}[] = [
  { id: "Tutte", label: "Tutte (16)" },
  { id: "OTS", label: "O.T.S." },
  { id: "CRA", label: "C.R.A. / OTR" },
  { id: "Plenaria", label: "Plenaria" },
];

export function getFederalPortals(): FederalPortal[] {
  return FEDERAL_PORTALS;
}

export function getRTOSeasonMetadata(): RTOSeasonMetadata {
  return RTO_SEASON_METADATA;
}

export function getRTOCalendar(): RTOEvent[] {
  return [...rtoCalendarData].sort((a, b) => a.date.localeCompare(b.date));
}

function normalizeReferenceIsoDate(
  events: RTOEvent[],
  referenceDate: Date = new Date(),
): string {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const day = String(referenceDate.getDate()).padStart(2, "0");
  const rawIso = `${year}-${month}-${day}`;

  if (events.length === 0) {
    return rawIso;
  }

  const firstEventYear = Number(events[0].date.slice(0, 4));
  const lastEventDate = events[events.length - 1].date;

  if (rawIso > lastEventDate && !Number.isNaN(firstEventYear)) {
    const adjustedYear =
      referenceDate.getMonth() >= 7 ? firstEventYear : firstEventYear + 1;
    return `${adjustedYear}-${month}-${day}`;
  }

  return rawIso;
}

export function getRTOCalendarWithStatus(
  referenceDate: Date = new Date(),
): (RTOEvent & { isCompleted: boolean })[] {
  const sorted = getRTOCalendar();
  const cutoffIso = normalizeReferenceIsoDate(sorted, referenceDate);

  return sorted.map((event) => ({
    ...event,
    isCompleted:
      typeof event.isCompleted === "boolean"
        ? event.isCompleted
        : event.date < cutoffIso,
  }));
}

export function getNextRTOEvent(referenceDate: Date = new Date()): RTOEvent {
  const withStatus = getRTOCalendarWithStatus(referenceDate);
  const upcoming = withStatus.find((event) => !event.isCompleted);
  return upcoming ?? withStatus[withStatus.length - 1];
}

export function formatRTODateShort(dateString: string): string {
  const parts = dateString.trim().split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export function formatRTODateVerbose(dateString: string): string {
  return `Venerdì ${formatDateItalian(dateString)}`;
}

export function formatRTOOptionLabel(event: RTOEvent): string {
  return `Ven ${formatRTODateShort(event.date)} (${event.time}) — ${event.title} [${event.target}]`;
}

export const giustificaFormSchema = z.object({
  cognome: z
    .string()
    .trim()
    .min(2, "Inserisci il cognome (minimo 2 caratteri)."),
  nome: z.string().trim().min(2, "Inserisci il nome (minimo 2 caratteri)."),
  email: z
    .string()
    .trim()
    .email("Inserisci un indirizzo email valido registrato su Sinfonia4You."),
  meccanografico: z
    .string()
    .trim()
    .regex(
      /^\d{5,8}$/,
      "Inserisci un Codice Meccanografico AIA valido (solo cifre, es. 7 numeri).",
    ),
  numeroTessera: z
    .string()
    .trim()
    .regex(
      /^\d{3,10}$/,
      "Inserisci un Numero Tessera Federale valido (solo cifre).",
    ),
  luogoNascita: z
    .string()
    .trim()
    .min(2, "Inserisci il Comune o Stato di nascita."),
  dataNascita: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Inserisci una data di nascita valida."),
  evento: z
    .string()
    .trim()
    .min(3, "Seleziona la Riunione Tecnica da giustificare."),
  motivo: z
    .string()
    .trim()
    .min(
      10,
      "Indica in modo dettagliato la motivazione dell'assenza (almeno 10 caratteri).",
    ),
  privacy: z
    .boolean()
    .refine(
      (val) => val === true,
      "È obbligatorio prendere visione dell'informativa privacy e acconsentire al trattamento dei dati.",
    ),
});
