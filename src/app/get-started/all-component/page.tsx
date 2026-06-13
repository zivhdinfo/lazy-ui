import type { Metadata } from "next";

import { AllComponentsPage } from "@/components/lazy/all-components-page";

export const metadata: Metadata = {
  title: "All components | Lazy-ui",
  description:
    "Every Lazy-ui component in one place — live previews, grouped by category.",
};

export default function AllComponentsRoute() {
  // Chrome (sidebar + header) lives in get-started/layout.tsx.
  return <AllComponentsPage />;
}
