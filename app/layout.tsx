import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { TopNav } from "@/components/TopNav";
import { MobileNav } from "@/components/MobileNav";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SectorOne — F1 Telemetry Dashboard",
    template: "%s | SectorOne",
  },
  description: "High-performance Formula 1 telemetry suite — real-time race replay, championship standings, fantasy leagues, and historical archives powered by OpenF1.",
  openGraph: {
    title: "SectorOne — F1 Telemetry Dashboard",
    description: "Track live F1 data, replay races, analyze strategy, and compete in fantasy leagues.",
    siteName: "SectorOne",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-f1-carbon">
        <TopNav />
        <AuthProvider>
          <main className="flex-1 pt-14 md:pt-16 pb-16 md:pb-0">{children}</main>
        </AuthProvider>
        <MobileNav />
      </body>
    </html>
  );
}