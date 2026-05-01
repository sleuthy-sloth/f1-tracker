import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "%s | F1 Tracker",
  description: "Real-time Formula 1 race replays and telemetry analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-f1-carbon">
        <header className="border-b border-white/10 bg-f1-dark/50 backdrop-blur-sm">
          <nav className="mx-auto flex h-16 max-w-7xl items-center px-6">
            <span className="text-xl font-bold tracking-tight text-f1-white">
              F1 Tracker
            </span>
          </nav>
        </header>
        <AuthProvider>
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}