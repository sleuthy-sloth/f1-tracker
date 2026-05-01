import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden">
      {/* Gradient accent line */}
      <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-f1-red to-transparent" />

      {/* Subtle checkered pattern hint */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            #fff 10px,
            #fff 11px
          ),
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 10px,
            #fff 10px,
            #fff 11px
          )`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-f1-white sm:text-6xl lg:text-7xl">
          F1 <span className="text-f1-red">Tracker</span>
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-f1-silver sm:text-xl">
          Real-time race replays, telemetry analysis, and session data
        </p>

        <Link href="/sessions" className="mt-4 rounded-full bg-f1-red px-8 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-red-700 hover:shadow-lg hover:shadow-f1-red/20 focus:outline-none focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-f1-carbon">
          Browse Sessions
        </Link>
      </div>
    </div>
  );
}