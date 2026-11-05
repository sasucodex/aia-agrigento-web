export interface PrivacyTocItem {
  id: string;
  number: string;
  label: string;
  href: string;
}

export interface PrivacyControllerField {
  label: string;
  value: string;
  note?: string;
  href?: string;
  isMono?: boolean;
}

export interface PrivacyDataCategory {
  id: string;
  number?: string;
  title: string;
  routeBadge?: string;
  items: string[];
  note?: string;
}

export interface PrivacyLegalBasisRow {
  purpose: string;
  dataCategory: string;
  legalBasisCode: string;
  legalBasisDescription: string;
  mandatoryNote: string;
}

export interface PrivacyNumberedItem {
  number?: string;
  title: string;
  description: string;
}

export interface PrivacyBulletItem {
  label: string;
  description: string;
}

export interface PrivacyRecipientSubItem {
  name: string;
  description: string;
}

export interface PrivacyRecipientItem {
  number?: string;
  title: string;
  description?: string;
  subItems?: PrivacyRecipientSubItem[];
}

export interface PrivacyRightItem {
  number?: string;
  title: string;
  article: string;
  description: string;
}

export interface PrivacyAuthorityInfo {
  name: string;
  address: string;
  websiteUrl: string;
  websiteLabel: string;
  phone: string;
  pec: string;
}

export interface CookieTableRow {
  type: string;
  status: string;
  isPresent: boolean;
  details: string;
}

export interface BrowserGuideLink {
  name: string;
  url: string;
}

export interface PrivacyDataset {
  seo: {
    title: string;
    description: string;
    canonical: string;
  };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    badge: string;
    lastUpdatedISO: string;
  };
  toc: {
    title: string;
    items: PrivacyTocItem[];
  };
  section1Controller: {
    id: string;
    number: string;
    title: string;
    intro: string;
    fields: PrivacyControllerField[];
    closingNote: string;
  };
  section2DataCollected: {
    id: string;
    number: string;
    title: string;
    intro: string;
    categories: PrivacyDataCategory[];
  };
  section3Purposes: {
    id: string;
    number: string;
    title: string;
    intro: string;
    tableHeaders: {
      purpose: string;
      dataCategory: string;
      legalBasis: string;
      mandatory: string;
    };
    rows: PrivacyLegalBasisRow[];
    noProfilingCallout: string;
  };
  section4Minors: {
    id: string;
    number: string;
    title: string;
    intro: string;
    points: PrivacyNumberedItem[];
  };
  section5HealthData: {
    id: string;
    number: string;
    title: string;
    intro: string;
    bullets: PrivacyBulletItem[];
  };
  section6Recipients: {
    id: string;
    number: string;
    title: string;
    intro: string;
    items: PrivacyRecipientItem[];
  };
  section7Transfers: {
    id: string;
    number: string;
    title: string;
    intro: string;
    safeguardsIntro: string;
    safeguards: string[];
  };
  section8Retention: {
    id: string;
    number: string;
    title: string;
    intro: string;
    items: PrivacyBulletItem[];
  };
  section9Rights: {
    id: string;
    number: string;
    title: string;
    intro: string;
    rights: PrivacyRightItem[];
    authority: PrivacyAuthorityInfo;
    exerciseTitle: string;
    exerciseIntro: string;
    exerciseEmail: string;
    exerciseSubjectTemplate: string;
    exerciseDeadlineNote: string;
  };
  section10Cookies: {
    id: string;
    secondaryId: string;
    number: string;
    title: string;
    intro: string;
    whatAreCookies: {
      title: string;
      description: string;
    };
    cookieTypes: {
      title: string;
      intro: string;
      tableHeaders: {
        type: string;
        present: string;
        details: string;
      };
      rows: CookieTableRow[];
    };
    noBannerReason: {
      title: string;
      paragraphs: string[];
    };
    openSource?: {
      title: string;
      description: string;
      repoUrl: string;
      repoLabel: string;
      repoHandle: string;
    };
    browserSettings: {
      title: string;
      intro: string;
      browsers: BrowserGuideLink[];
    };
  };
  rightsContactBox: {
    kicker?: string;
    title: string;
    description: string;
    email: string;
    subjectLine: string;
    responseGuarantee: string;
    templateLabel?: string;
    templateText?: string;
  };
}
