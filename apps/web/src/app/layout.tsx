import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AmroGen • Autonomous Revenue Orchestration",
  description:
    "AmroGen coordinates multi-agent revenue workflows across discovery, qualification, outreach, and analytics in real time.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
