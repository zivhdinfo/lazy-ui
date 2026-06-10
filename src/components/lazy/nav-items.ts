type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Docs", href: "/get-started" },
  // The component overview page is gone; "Components" lands on the docs intro,
  // where the sidebar lists every component. activeNavIndex still highlights it
  // on any /components/<type>/<slug> detail route.
  { label: "Components", href: "/get-started" },
  { label: "Blocks", href: "/blocks" },
  { label: "Changelog", href: "/get-started/changelog" },
];

export function activeNavIndex(pathname: string | null): number {
  if (!pathname) return -1;
  if (pathname === "/") return -1;
  if (pathname.startsWith("/blocks")) return 2;
  if (pathname.startsWith("/components")) return 1;
  if (pathname === "/get-started/changelog") return 3;
  if (pathname.startsWith("/get-started")) return 0;
  return -1;
}
