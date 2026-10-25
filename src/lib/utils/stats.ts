import statsRaw from "@/data/stats.json";
import type { StatMetricItem, StatsDataset } from "@/types/stats";

const statsData = statsRaw as StatsDataset;

export function getStats(): StatsDataset {
  return statsData;
}

export function getStatsData(): StatsDataset {
  return statsData;
}

export function getStatItems(): StatMetricItem[] {
  return statsData.items;
}
