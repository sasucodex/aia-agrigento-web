export interface NavItem {
  label: string;
  href: string;
  exact?: boolean;
}

export interface NavigationConfig {
  mainNav: NavItem[];
  cta: {
    label: string;
    href: string;
  };
}
