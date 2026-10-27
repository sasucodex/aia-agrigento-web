import organicoRaw from "@/data/organico.json";
import type { Associato } from "@/types/organico";

export function getOrganico(): Associato[] {
  return organicoRaw as Associato[];
}

export function getBenemeriti(): Associato[] {
  return getOrganico()
    .filter((a) => a.isBenemerito)
    .sort((a, b) => a.cognome.localeCompare(b.cognome, "it"));
}

export function getNazionali(): Associato[] {
  return getOrganico()
    .filter((a) => a.livello === "nazionale")
    .sort((a, b) => a.cognome.localeCompare(b.cognome, "it"));
}

export function getRegionali(): Associato[] {
  return getOrganico()
    .filter((a) => a.livello === "regionale")
    .sort((a, b) => a.cognome.localeCompare(b.cognome, "it"));
}

export function getOTS(settore?: "c11" | "c5" | "osservatore"): Associato[] {
  return getOrganico()
    .filter((a) => a.livello === "ots" && (!settore || a.settore === settore))
    .sort((a, b) => a.cognome.localeCompare(b.cognome, "it"));
}
