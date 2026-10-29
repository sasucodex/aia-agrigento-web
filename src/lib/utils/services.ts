import { z } from "zod";
import rtoCalendarRaw from "@/data/rto-calendar.json";
import documentsRaw from "@/data/documents.json";
import { formatDateItalian } from "@/lib/utils/date";
import { getAthleticTests, getPoloInfo } from "@/lib/utils/polo";
import type {
  AccreditiSpecification,
  DocumentCluster,
  DocumentType,
  FederalPortal,
  RTOCategory,
  RTOEvent,
  RTOSeasonMetadata,
  ServiceDocument,
} from "@/types/services";

export { getAthleticTests, getPoloInfo };

const rtoCalendarData = rtoCalendarRaw as RTOEvent[];
const documentsData = documentsRaw as ServiceDocument[];

export const FEDERAL_PORTALS: FederalPortal[] = [
  {
    id: "sinfonia4you",
    kicker: "",
    title: "Sinfonia4You (Portale Ufficiale AIA)",
    description:
      "Accesso per consultazione designazioni, accettazione gare, anagrafica associativa e rendicontazione rimborsi spesa.",
    ctaLabel: "Accedi a Sinfonia4You",
    url: "https://servizi.aia-figc.it/sinfonia4you/",
    variant: "primary",
  },
  {
    id: "regolamenti-ufficiali-figc",
    kicker: "",
    title: "Regolamenti Ufficiali & Circolari AIA FIGC",
    description:
      "Regole del Gioco del Calcio IFAB con Guida Pratica, Circolare n. 1 del Settore Tecnico, Regolamento Calcio a 5, Beach Soccer e Codice Etico.",
    ctaLabel: "Visita Area Download Regolamenti",
    url: "https://www.aia-figc.it/download/",
    variant: "secondary",
  },
];

export const DOCUMENT_CLUSTERS: { id: DocumentCluster; label: string }[] = [
  { id: "gare-congedi", label: "Gare, Congedi & Disponibilità" },
  {
    id: "tesseramento-amministrazione",
    label: "Tesseramento & Amministrazione",
  },
  { id: "tecnica-campo", label: "Tecnica Arbitrale sul Campo" },
];

export const RTO_SPECIAL_EVENT_OPTION =
  "Altra convocazione straordinaria o specifica";

export const RTO_SEASON_METADATA: RTOSeasonMetadata = {
  season: "2026/2027",
  documentDate: "22/08/2026",
  pdfUrl: "/documents/calendario-rto-2025-2026.pdf",
  regulationHeading: "PARTECIPAZIONE OBBLIGATORIA (ART. 40 E 42 REG. AIA)",
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

export const ACCREDITI_SPECIFICATION: AccreditiSpecification = {
  kicker: "",
  title: "Accrediti Gare",
  leadParagraph:
    "Si comunica agli associati che la richiesta di accredito per assistere alle gare casalinghe delle squadre professionistiche siciliane (Palermo, Catania, Akragas, Trapani, ecc.) dovrà essere inviata esclusivamente entro le ore 12:00 di 3 giorni prima la gara (mercoledì per sabato, giovedì per domenica) compilando il modulo presente in questa pagina.",
  mandatoryFieldsIntro:
    "La richiesta dovrà pervenire esclusivamente dal proprio indirizzo e-mail registrato nella piattaforma sinfonia4you e dovrà contenere i seguenti dati obbligatori nessuno escluso:",
  mandatoryFields: [
    "Cognome e Nome",
    "Cod. meccanografico",
    "Tessera n.",
    "Luogo di nascita",
    "Data di nascita",
  ],
  delegationNotice:
    "Non sono ammesse deleghe e non sono accettate richieste che non rispettino i criteri di cui sopra.",
  confirmationNotice:
    "Le richieste di accredito verranno confermate esclusivamente attraverso l'indirizzo <a href=\"mailto:accrediti@aiaagrigento.it\" class=\"text-[#004b97] hover:underline underline-offset-4\">accrediti@aiaagrigento.it</a> rispettando l’ordine di ricezione e comunque fino ad esaurimento dei posti disponibili. In caso di mancata risposta, la richiesta è da considerarsi respinta a causa dell’esaurimento dei posti disponibili.",
  stadiumPickupIntro:
    "In caso di avvenuta conferma, dovrai presentarti allo Stadio almeno 60 minuti prima dell'inizio dell'incontro presso il botteghino accrediti sito nello stadio esibendo:",
  stadiumDocuments: [
    "A. Documento d'identità",
    "B. Tessera Federale in corso di validità vidimata dall'Agenzia delle Entrate di Roma (in originale)",
  ],
  closingWarning:
    "L'accredito rilasciato è personale e assolutamente non cedibile. L'ingresso verrà chiuso 30 minuti prima dell'inizio della manifestazione sportiva e il diritto di prenotazione scadrà automaticamente; tale evenienza precluderà la possibilità d'inserimento nelle successive liste per tutta la durata del campionato.",
  finalNotice: "Non sono accettate altre forme di richiesta accrediti.",
  email: "accrediti@aiaagrigento.it",
  ctaLabel: "Compila Modulo Richiesta Accredito",
};

export function getFederalPortals(): FederalPortal[] {
  return FEDERAL_PORTALS;
}

export function getRTOSeasonMetadata(): RTOSeasonMetadata {
  return RTO_SEASON_METADATA;
}

export function getRTOCalendar(): RTOEvent[] {
  return [...rtoCalendarData].sort((a, b) => a.date.localeCompare(b.date));
}

export function getAllDocuments(): ServiceDocument[] {
  return documentsData;
}

export function getDocumentsByType(type: DocumentType): ServiceDocument[] {
  return documentsData.filter((doc) => doc.type === type);
}

export function getSezionaleDocuments(): ServiceDocument[] {
  return getDocumentsByType("sezionale");
}

export function getNazionaleExternalDocument(): ServiceDocument | undefined {
  return documentsData.find((doc) => doc.type === "nazionale-external");
}

export function getRegolamentiExternalDocument(): ServiceDocument | undefined {
  return documentsData.find((doc) => doc.type === "regolamenti-external");
}

export function getSezionaleDocumentsByCluster(): {
  id: DocumentCluster;
  label: string;
  documents: ServiceDocument[];
}[] {
  const sezionali = getSezionaleDocuments();
  return DOCUMENT_CLUSTERS.map((cluster) => ({
    ...cluster,
    documents: sezionali.filter((doc) => doc.cluster === cluster.id),
  })).filter((cluster) => cluster.documents.length > 0);
}

export function getAccreditiSpecification(): AccreditiSpecification {
  return ACCREDITI_SPECIFICATION;
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
  return `Ven ${formatRTODateShort(event.date)} (${event.time}) - ${event.title} [${event.target}]`;
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

export const accreditoFormSchema = z.object({
  cognome: z
    .string()
    .trim()
    .min(2, "Inserisci il cognome (minimo 2 caratteri)."),
  nome: z.string().trim().min(2, "Inserisci il nome (minimo 2 caratteri)."),
  email: z
    .string()
    .trim()
    .email("Inserisci il tuo indirizzo email registrato su Sinfonia4You."),
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
  partita: z
    .string()
    .trim()
    .min(
      5,
      "Indica la gara richiesta con data e campionato (es. Akragas - Siracusa del 15/03/2026).",
    ),
  note: z.string().trim().optional().default(""),
  privacy: z
    .boolean()
    .refine(
      (val) => val === true,
      "È obbligatorio confermare la titolarità della tessera federale e acconsentire al trattamento dei dati.",
    ),
});
