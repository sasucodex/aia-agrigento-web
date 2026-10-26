import presidentsData from "@/data/presidents.json";
import type { President } from "@/types/presidents";

export function getPresidents(): President[] {
  return presidentsData as President[];
}

export function getCurrentPresident(): President | undefined {
  return getPresidents().find((president) => president.isCurrent);
}
