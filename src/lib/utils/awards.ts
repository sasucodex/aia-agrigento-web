import awardsData from "@/data/awards.json";
import type {
  AwardsData,
  LivatinoData,
  TraditionalAward,
} from "@/types/awards";

export function getAwardsData(): AwardsData {
  return awardsData as AwardsData;
}

export function getLivatinoAward(): LivatinoData {
  return (awardsData as AwardsData).livatino;
}

export function getTraditionalAwards(): TraditionalAward[] {
  return (awardsData as AwardsData).traditional;
}

export function getAwardById(id: string): TraditionalAward | undefined {
  return getTraditionalAwards().find((award) => award.id === id);
}
