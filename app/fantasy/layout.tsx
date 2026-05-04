import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fantasy F1 League",
  description: "Build and manage your fantasy F1 team. Create leagues, track points, and compete with friends.",
};

export default function FantasyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}