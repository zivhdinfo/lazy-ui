import type { Metadata } from "next";
import {
  Outfit,
  Geist_Mono,
  JetBrains_Mono,
  Instrument_Serif,
} from "next/font/google";

import "./globals.css";

// Primary UI face for the whole project. Next.js emits a size-adjusted
// "Outfit Fallback" automatically, so the resolved stack is
// `Outfit, "Outfit Fallback", …`.
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

// Mono accent face used by the new home surface (labels, kbd, addr bar).
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
  display: "swap",
});

const SITE_URL = "https://2lazyui.com";
const SITE_DESCRIPTION =
  "Lazy UI is a copy-paste library of React + Tailwind components, animated backgrounds, and UI primitives that install straight into your app as shadcn registry files - no npm package, source lands fully editable.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lazy UI - Great interfaces, minimal effort.",
    template: "%s - Lazy UI",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Lazy UI",
  keywords: [
    "Lazy UI",
    "React components",
    "Tailwind CSS",
    "shadcn registry",
    "UI component library",
    "animated backgrounds",
    "copy paste components",
    "Next.js components",
    "WebGL backgrounds",
    "motion primitives",
  ],
  authors: [{ name: "Zivhd", url: "https://github.com/zivhdinfo" }],
  creator: "Zivhd",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Lazy UI",
    title: "Lazy UI - Great interfaces, minimal effort.",
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [{ url: "/logo.png", alt: "Lazy UI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lazy UI - Great interfaces, minimal effort.",
    description: SITE_DESCRIPTION,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark h-full antialiased ${outfit.variable} ${geistMono.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
