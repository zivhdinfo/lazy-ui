type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Docs", href: "/docs" },
  { label: "Components", href: "/components" },
  { label: "Blocks", href: "/blocks" },
  { label: "Changelog", href: "/docs/changelog" },
];

export function activeNavIndex(pathname: string | null): number {
  if (!pathname) return -1;
  if (pathname === "/") return -1;
  if (pathname.startsWith("/blocks")) return 2;
  if (pathname.startsWith("/components")) return 1;
  if (pathname === "/docs/changelog") return 3;
  if (pathname.startsWith("/docs")) return 0;
  return -1;
}
