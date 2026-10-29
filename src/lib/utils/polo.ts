import poloRaw from "@/data/polo.json";
import athleticTestsRaw from "@/data/athletic-tests.json";
import type { AthleticTest, PoloInfo } from "@/types/polo";

const poloData = poloRaw as PoloInfo;
const athleticTestsData = athleticTestsRaw as AthleticTest[];

export function getPoloInfo(): PoloInfo {
  return poloData;
}

export function getAthleticTests(): AthleticTest[] {
  return athleticTestsData;
}
