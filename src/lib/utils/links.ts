import linksRaw from "@/data/links.json";
import type {
  LinksDataset,
  QuickSocialLink,
  ServiceLinkItem,
} from "@/types/links";

const linksData = linksRaw as LinksDataset;

export function getLinksData(): LinksDataset {
  return linksData;
}

export function getDesignations(): ServiceLinkItem[] {
  return linksData.designations;
}

export function getOfficialBulletins(): ServiceLinkItem[] {
  return linksData.officialBulletins;
}

export function getAiaLinks(): ServiceLinkItem[] {
  return linksData.aiaLinks;
}

export function getSocialLinks(): QuickSocialLink[] {
  return linksData.socials;
}
