const ITALIAN_MONTHS = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
] as const;

export function formatDateItalian(dateString: string): string {
  const parts = dateString.trim().split("-");
  if (parts.length === 3) {
    const year = Number(parts[0]);
    const monthIndex = Number(parts[1]) - 1;
    const day = Number(parts[2]);
    if (
      !Number.isNaN(year) &&
      !Number.isNaN(day) &&
      monthIndex >= 0 &&
      monthIndex < 12
    ) {
      return `${day} ${ITALIAN_MONTHS[monthIndex]} ${year}`;
    }
  }

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return dateString;
  }

  return `${parsed.getUTCDate()} ${ITALIAN_MONTHS[parsed.getUTCMonth()]} ${parsed.getUTCFullYear()}`;
}
