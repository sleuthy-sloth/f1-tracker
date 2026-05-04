import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Strategy Lab",
  description: "Interactive F1 race replay with satellite track map, telemetry HUD, and strategy analysis tools.",
};

export default function StrategyLabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}