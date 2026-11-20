export interface StatMetricItem {
  id: "members" | "history" | "benemeriti-referees" | "national-awards";
  value: string;
  label: string;
  sublabel?: string;
}

export interface StatsDataset {
  membersCount: string;
  historyYears: string;
  benemeritiReferees: string;
  nationalAwards: string;
  items: StatMetricItem[];
}
