export type LivelloOrganico = "nazionale" | "regionale" | "ots";

export type SettoreTecnico =
  | "c11"
  | "c5"
  | "assistente"
  | "osservatore"
  | "dirigente";

export type QualificaArbitro = "AB" | "AE" | "AE5" | "AA" | "OA" | "AFR";

export interface Associato {
  id: string;
  cognome: string;
  nome: string;
  qualifica: QualificaArbitro;
  ruolo: string;
  organoTecnico: string;
  livello: LivelloOrganico;
  settore: SettoreTecnico;
  isBenemerito: boolean;
  foto?: string;
  ordine?: number;
}
