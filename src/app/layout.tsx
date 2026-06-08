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

export const metadata: Metadata = {
  title: "Lazy-ui — Build lazily.",
  description:
    "A quietly opinionated Tailwind CSS component library you copy, paste, and ship.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`dark h-full antialiased ${outfit.variable} ${geistMono.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
