/** Base URL for registry JSON. Dev → local server, prod → public domain.
 *  Override with NEXT_PUBLIC_REGISTRY_BASE_URL if needed (e.g. staging). */
export const REGISTRY_BASE_URL =
  process.env.NEXT_PUBLIC_REGISTRY_BASE_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000/r"
    : "https://2lazyui.com/r");
