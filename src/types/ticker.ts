export type TickerUrgency = "urgent" | "warning" | "info";

export interface TickerAlert {
  id: string;
  active: boolean;
  urgency: TickerUrgency;
  label: string;
  message: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  target?: string;
  expiresAt?: string;
  ctaLabel?: string;
  ctaHref?: string;
}
