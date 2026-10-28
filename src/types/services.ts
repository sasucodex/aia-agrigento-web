export type RTOCategory = "OTS" | "CRA" | "Plenaria" | "Specifica";

export interface RTOEvent {
  id: string;
  number: number;
  date: string;
  time: string;
  title: string;
  target: string;
  location: string;
  category: RTOCategory;
  isCompleted?: boolean;
}

export interface FederalPortal {
  id: string;
  kicker: string;
  title: string;
  description: string;
  ctaLabel: string;
  url: string;
  variant: "primary" | "secondary";
}

export interface RTOSeasonMetadata {
  season: string;
  documentDate: string;
  pdfUrl: string;
  regulationHeading: string;
  regulationArticle: string;
  regulationText: string;
}

export type DocumentType =
  "sezionale" | "nazionale-external" | "regolamenti-external" | "atletico";

export interface ServiceDocument {
  id: string;
  title: string;
  description: string;
  type: DocumentType;
  fileName: string;
  fileSize?: string;
  previewUrl: string;
  isExternal?: boolean;
  updatedSeason: string;
}

export interface AthleticTest {
  id: string;
  name: string;
  description: string;
  audioUrl?: string;
}

export interface PoloInfo {
  venue: string;
  address: string;
  days: string;
  hours: string;
  referents: string[];
  medicalCertificateNotice: string;
}

export interface GiustificaFormPayload {
  cognome: string;
  nome: string;
  email: string;
  meccanografico: string;
  numeroTessera: string;
  luogoNascita: string;
  dataNascita: string;
  evento: string;
  motivo: string;
  privacy: boolean;
}

export interface AccreditoFormPayload {
  cognome: string;
  nome: string;
  email: string;
  meccanografico: string;
  numeroTessera: string;
  luogoNascita: string;
  dataNascita: string;
  partita: string;
  note: string;
  privacy: boolean;
}
