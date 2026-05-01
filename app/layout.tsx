import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { SideNav } from "@/components/SideNav";
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
  title: "%s | SectorOne",
  description: "High-performance Formula 1 telemetry suite",
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
        <SideNav />
        <AuthProvider>
          <main className="flex-1 md:ml-60 pb-16 md:pb-0">{children}</main>
        </AuthProvider>
        <MobileNav />
      </body>
    </html>
  );
}