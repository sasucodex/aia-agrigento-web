import type { NavItem, NavigationConfig } from "@/types/navigation";

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", exact: true },
  { label: "La Sezione", href: "/la-sezione" },
  { label: "Organico", href: "/organico" },
  { label: "Premi", href: "/premi" },
  { label: "Blog", href: "/blog" },
  { label: "Area Associati", href: "/area-associati" },
  { label: "Contatti", href: "/contatti" },
];

export const PRIMARY_CTA = {
  label: "Diventa Arbitro",
  href: "/diventa-arbitro",
} as const;

export const NAVIGATION_CONFIG: NavigationConfig = {
  mainNav: MAIN_NAV_ITEMS,
  cta: PRIMARY_CTA,
};

export function isNavItemActive(currentPath: string, item: NavItem): boolean {
  const normalizedCurrent =
    currentPath.length > 1 && currentPath.endsWith("/")
      ? currentPath.slice(0, -1)
      : currentPath;
  const normalizedTarget =
    item.href.length > 1 && item.href.endsWith("/")
      ? item.href.slice(0, -1)
      : item.href;

  if (item.exact || normalizedTarget === "/") {
    return normalizedCurrent === normalizedTarget;
  }

  return (
    normalizedCurrent === normalizedTarget ||
    normalizedCurrent.startsWith(`${normalizedTarget}/`)
  );
}
