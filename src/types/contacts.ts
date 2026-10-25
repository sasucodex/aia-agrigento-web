export interface ContactAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  region: string;
  country: string;
  notes?: string;
}

export interface ContactPhones {
  landline: string;
  mobile: string;
  landlineDisplay: string;
  mobileDisplay: string;
}

export interface OpeningHourItem {
  day: string;
  hours: string;
  description: string;
}

export interface MapLinks {
  googleMaps: string;
  appleMaps: string;
  waze: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface SocialLinkItem {
  platform: "instagram" | "facebook";
  label: string;
  kicker: string;
  handle: string;
  url: string;
  description: string;
}

export interface OperationalEmails {
  info: string;
  federal: string;
  segreteria: string;
  corsoArbitri: string;
  accrediti: string;
  giustificazioniRto: string;
  relazioni: string;
}

export interface AuthorCredit {
  name: string;
  githubUrl: string;
}

export interface SectionContacts {
  organizationName: string;
  taxId: string;
  address: ContactAddress;
  openingHours: OpeningHourItem[];
  phones: ContactPhones;
  email: string;
  emails: OperationalEmails;
  maps: MapLinks;
  social: {
    sharedDescription: string;
    channels: SocialLinkItem[];
  };
  author: AuthorCredit;
}
