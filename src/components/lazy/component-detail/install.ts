import { REGISTRY_BASE_URL, type ComponentItem } from "@/registry/components";

export const PM_TABS = ["npm", "pnpm", "bun", "yarn"] as const;
export type PmTab = (typeof PM_TABS)[number];

export function installCmd(pm: PmTab, slug: string): string {
  const url = `${REGISTRY_BASE_URL}/${slug}.json`;
  if (pm === "npm") return `npx shadcn@latest add ${url}`;
  if (pm === "bun") return `bunx shadcn@latest add ${url}`;
  return `${pm} dlx shadcn@latest add ${url}`;
}

export function importPathFor(component: ComponentItem) {
  return `@/${component.target.replace(/\/[^/]+\.tsx$/, "")}`;
}
