export interface AthleticTest {
  id: string;
  name: string;
  shortCode: string;
  target: string;
  threshold: string;
  description: string;
  audioUrl?: string;
  audioLabel?: string;
}

export interface PoloInfo {
  kicker: string;
  title: string;
  intro: string;
  venue: string;
  address: string;
  days: string;
  hours: string;
  referents: string[];
  accessPolicy: string;
  medicalCertificateNotice?: string;
  limitsDocumentUrl: string;
  limitsDocumentLabel: string;
}
