export interface StatMetricItem {
  id: "members" | "history" | "national-referees" | "national-awards";
  value: string;
  label: string;
  sublabel?: string;
}

export interface StatsDataset {
  membersCount: string;
  historyYears: string;
  nationalReferees: string;
  nationalAwards: string;
  items: StatMetricItem[];
}
