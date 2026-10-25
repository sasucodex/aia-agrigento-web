import tickerRaw from "@/data/ticker.json";
import type { TickerAlert } from "@/types/ticker";

const tickerData = tickerRaw as TickerAlert;

export function getTickerData(): TickerAlert {
  return tickerData;
}

export function isTickerActive(
  alert: TickerAlert = tickerData,
  referenceDate: Date = new Date(),
): boolean {
  if (!alert.active || !alert.message.trim()) {
    return false;
  }

  if (alert.expiresAt) {
    const expiration = new Date(`${alert.expiresAt}T23:59:59`);
    if (!Number.isNaN(expiration.getTime()) && referenceDate > expiration) {
      return false;
    }
  }

  return true;
}

export function getTickerAlert(
  referenceDate: Date = new Date(),
): TickerAlert | null {
  return isTickerActive(tickerData, referenceDate) ? tickerData : null;
}
