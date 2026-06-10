import type { Metadata } from "next";

import { IntroPage } from "@/components/lazy/intro-page";

export const metadata: Metadata = {
  title: "Introduction | Lazy-ui",
  description:
    "Lazy-ui is an open-source collection of React components — WebGL backgrounds, text and motion effects, device mocks, and focused interactive primitives.",
};

export default function GetStartedPage() {
  // Chrome (sidebar + header) lives in get-started/layout.tsx.
  return <IntroPage />;
}
