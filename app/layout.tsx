import type { Metadata } from "next";
import { Barlow_Condensed, Barlow, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { SideNav } from "@/components/SideNav";
import { MobileNav } from "@/components/MobileNav";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SectorOne — F1 Telemetry Dashboard",
    template: "%s | SectorOne",
  },
  description:
    "High-performance Formula 1 telemetry suite — race replay, championship standings, fantasy leagues, and historical archives powered by OpenF1.",
  openGraph: {
    title: "SectorOne — F1 Telemetry Dashboard",
    description:
      "Replay F1 races, analyze strategy, and compete in fantasy leagues.",
    siteName: "SectorOne",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${barlow.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="h-full flex bg-[#0C0E12] text-[#EEEEF0] antialiased">
        <AuthProvider>
          {/* Desktop sidebar — hidden on mobile */}
          <SideNav />

          {/* Main content — offset by sidebar on desktop */}
          <div className="flex-1 flex flex-col min-w-0 md:ml-[200px]">
            <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
          </div>

          {/* Mobile bottom tab bar */}
          <MobileNav />
        </AuthProvider>
      </body>
    </html>
  );
}
