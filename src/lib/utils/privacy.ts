import privacyRaw from "@/data/privacy.json";
import type { PrivacyDataset } from "@/types/privacy";

const privacyData = privacyRaw as PrivacyDataset;

export function getPrivacyPolicyData(): PrivacyDataset {
  return privacyData;
}
