export interface LaunchSEO {
  title: string;
  description: string;
  robots: string;
  canonical: string;
}

export interface LaunchHeader {
  overline: string;
  subtitle: string;
  logoAlt: string;
}

export interface LaunchHero {
  kicker?: string;
  title: string;
  lead: string;
}

export interface LaunchCountdownLabels {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

export interface LaunchCountdown {
  labels: LaunchCountdownLabels;
  completedMessage: string;
}

export type LaunchServiceButtonStyle = "gold" | "blue" | "outline";

export interface LaunchServiceItem {
  id: string;
  title: string;
  badge?: string;
  audience?: string;
  description: string;
  buttonText: string;
  href?: string;
  modalTarget?: "giustificazioni" | "accrediti";
  style: LaunchServiceButtonStyle;
}

export interface LaunchServicesSection {
  kicker?: string;
  title: string;
  subtitle: string;
  items: LaunchServiceItem[];
}

export interface LaunchFooter {
  organizationFullTitle: string;
  confidentialityNote: string;
}

export type CourseKeyPointTone = "emerald" | "slate" | "blue" | "amber";

export interface CourseKeyPointBadge {
  label: string;
  tone: CourseKeyPointTone;
}

export interface LaunchCoursePageData {
  seo: LaunchSEO;
  backLinkLabel: string;
  backLinkHref: string;
  kicker?: string;
  title: string;
  lead: string;
  badges?: CourseKeyPointBadge[];
}

export interface LaunchData {
  meetingDate: string;
  meetingTitle: string;
  meetingLocation: string;
  seo: LaunchSEO;
  header: LaunchHeader;
  hero: LaunchHero;
  countdown: LaunchCountdown;
  services: LaunchServicesSection;
  footer: LaunchFooter;
  coursePage: LaunchCoursePageData;
}
