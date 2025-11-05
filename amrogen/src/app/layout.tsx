import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Space_Grotesk,
  IBM_Plex_Mono,
} from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans-base",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

const heading = Space_Grotesk({
  variable: "--font-heading",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono-base",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://amrogen.ai"),
  title: {
    default: "AmroGen | Autonomous Revenue OS",
    template: "%s | AmroGen",
  },
  description:
    "AmroGen is the hybrid Claude + Gemini sales automation platform that discovers, qualifies, and activates revenue conversations autonomously.",
  keywords: [
    "sales automation",
    "AI agents",
    "Claude Agent SDK",
    "Gemini API",
    "Hyperbrowser",
    "lead orchestration",
  ],
  openGraph: {
    title: "AmroGen | Autonomous Revenue OS",
    description:
      "Hybrid multi-agent revenue orchestration built on Claude, Gemini, and Hyperbrowser.",
    url: "https://amrogen.ai",
    siteName: "AmroGen",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AmroGen | Autonomous Revenue OS",
    description:
      "Orchestrate lead discovery, qualification, outreach, and follow-up with autonomous AI teams.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${heading.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
