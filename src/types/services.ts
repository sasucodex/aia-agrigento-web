import type { AthleticTest, PoloInfo } from "@/types/polo";

export type { AthleticTest, PoloInfo };

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
  | "sezionale"
  | "nazionale-external"
  | "regolamenti-external"
  | "atletico";

export type DocumentCluster =
  | "gare-congedi"
  | "tesseramento-amministrazione"
  | "tecnica-campo";

export interface ServiceDocument {
  id: string;
  title: string;
  description: string;
  type: DocumentType;
  cluster?: DocumentCluster;
  fileName: string;
  fileSize?: string;
  previewUrl: string;
  isExternal?: boolean;
  updatedSeason: string;
}

export interface AccreditiSpecification {
  kicker: string;
  title: string;
  leadParagraph: string;
  mandatoryFieldsIntro: string;
  mandatoryFields: string[];
  delegationNotice: string;
  confirmationNotice: string;
  stadiumPickupIntro: string;
  stadiumDocuments: string[];
  closingWarning: string;
  finalNotice: string;
  email: string;
  ctaLabel: string;
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
