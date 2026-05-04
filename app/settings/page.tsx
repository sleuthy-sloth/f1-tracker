import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your SectorOne preferences and account settings.",
};

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-heading text-4xl md:text-5xl font-bold text-f1-white mb-2">SETTINGS</h1>
      <p className="text-f1-silver mb-8">Manage your preferences</p>
      
      {/* Account Section */}
      <section className="mb-8">
        <h2 className="font-heading text-lg font-bold text-f1-white mb-4 border-b border-white/[0.07] pb-2 uppercase tracking-wider">Account</h2>
        <div className="space-y-4">
          <Link href="/auth" className="block rounded-xl border border-white/[0.07] bg-[#111418] p-4 hover:bg-white/[0.04] transition-colors">
            <p className="text-f1-white font-medium">Sign In / Account</p>
            <p className="text-f1-silver text-sm">Manage your login, password, and authentication</p>
          </Link>
        </div>
      </section>
      
      {/* Preferences Section (placeholder) */}
      <section className="mb-8">
        <h2 className="font-heading text-lg font-bold text-f1-white mb-4 border-b border-white/[0.07] pb-2 uppercase tracking-wider">Preferences</h2>
        <div className="rounded-xl border border-white/[0.07] bg-[#111418] p-4">
          <p className="text-f1-silver text-sm">Preference settings coming soon</p>
        </div>
      </section>

      {/* About Section */}
      <section>
        <h2 className="font-heading text-lg font-bold text-f1-white mb-4 border-b border-white/[0.07] pb-2 uppercase tracking-wider">About</h2>
        <div className="rounded-xl border border-white/[0.07] bg-[#111418] p-4 space-y-2">
          <p className="text-f1-silver text-sm">SectorOne v0.5.0</p>
          <p className="text-f1-silver text-sm">Powered by OpenF1 API and NVIDIA NIM</p>
          <p className="text-f1-silver text-xs mt-2">Not affiliated with Formula 1 or any F1 team.</p>
        </div>
      </section>
    </div>
  );
}