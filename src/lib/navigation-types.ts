export type PillNavItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  children?: PillNavItem[];
};
