export interface ServiceLinkItem {
  id: string;
  title: string;
  url: string;
  column?: 1 | 2 | 3;
}

export interface QuickSocialLink {
  id: string;
  platform: "Instagram" | "Facebook";
  handle: string;
  url: string;
}

export interface LinksDataset {
  designations: ServiceLinkItem[];
  officialBulletins: ServiceLinkItem[];
  aiaLinks: ServiceLinkItem[];
  socials: QuickSocialLink[];
}
