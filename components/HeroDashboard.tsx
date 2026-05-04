"use client";

import React from "react";
import { TireIndicator } from "./TireIndicator";
import { CircuitOutline } from "./CircuitOutline";
import { TelemetryPulse } from "./TelemetryPulse";

const MOCK = {
  race: "GRAND PRIX OF ITALY – MONZA",
  lap: 10,
  totalLaps: 53,
  time: "01:23:45.670",
  driver: { name: "HAMILTON", team: "Mercedes", teamColor: "#27F4D2" },
  speed: 312,
  gear: 6,
  rpm: 11200,
  maxRpm: 15000,
  drs: true,
  engineTemp: 108,
  tires: { fl: 82, fr: 80, rl: 85, rr: 83 },
  brakes: { fl: 750, fr: 692, rl: 714, rr: 736 },
  standings: [
    { pos: 1, driver: "HAMILTON",   team: "Mercedes", color: "#27F4D2", lapTime: "1:23.668", gap: "—"      },
    { pos: 2, driver: "BOTTAS",     team: "Mercedes", color: "#27F4D2", lapTime: "1:24.578", gap: "+0.910" },
    { pos: 3, driver: "VERSTAPPEN", team: "Red Bull",  color: "#3671C6", lapTime: "1:24.305", gap: "+1.233" },
    { pos: 4, driver: "VETTEL",     team: "Ferrari",   color: "#E8002D", lapTime: "1:24.520", gap: "+2.041" },
    { pos: 5, driver: "LECLERC",    team: "Ferrari",   color: "#E8002D", lapTime: "1:25.333", gap: "+3.102" },
    { pos: 6, driver: "NORRIS",     team: "McLaren",   color: "#FF8000", lapTime: "1:25.367", gap: "+4.887" },
    { pos: 7, driver: "SAINZ",      team: "McLaren",   color: "#FF8000", lapTime: "1:25.396", gap: "+5.230" },
    { pos: 8, driver: "RICCIARDO",  team: "Renault",   color: "#FFF500", lapTime: "1:25.144", gap: "+6.109" },
  ],
};

function getRpmColor(rpm: number, maxRpm: number): string {
  const ratio = rpm / maxRpm;
  if (ratio > 0.85) return "#ef4444";
  if (ratio > 0.7) return "#eab308";
  return "#22c55e";
}

export function HeroDashboard() {
  const rpmRatio = MOCK.rpm / MOCK.maxRpm;
  const rpmColor = getRpmColor(MOCK.rpm, MOCK.maxRpm);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-6">
      {/* Unified bordered panel */}
      <div className="border border-white/8 rounded-xl overflow-hidden bg-surface-container-low">

        {/* Race header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 bg-surface-dim">
          <span className="text-sm font-black font-heading tracking-wide text-f1-white">
            {MOCK.race}
          </span>
          <div className="flex items-center gap-4 font-mono text-xs">
            <span className="text-f1-silver/50">
              LAP <span className="text-f1-white font-bold">{MOCK.lap}</span>
              <span className="text-f1-silver/30 mx-1">/</span>
              {MOCK.totalLaps}
            </span>
            <div className="w-px h-3 bg-white/10" />
            <span className="text-f1-white font-bold tracking-widest">{MOCK.time}</span>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/8 divide-y divide-white/8">

            {/* Driver telemetry */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: MOCK.driver.teamColor }}
                />
                <span className="text-[11px] font-black font-heading text-f1-white tracking-wide">
                  L{MOCK.lap}/{MOCK.totalLaps} – {MOCK.driver.name}
                </span>
              </div>

              {/* Speed */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl font-black font-heading text-f1-white leading-none">
                  {MOCK.speed}
                </span>
                <span className="text-xs text-f1-silver/40 font-mono mb-0.5">KM/H</span>
              </div>

              {/* RPM bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="data-label">RPM</span>
                  <span className="text-[10px] font-mono text-f1-silver/50">
                    {MOCK.rpm.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${rpmRatio * 100}%`, backgroundColor: rpmColor }}
                  />
                </div>
              </div>

              {/* Gear + DRS */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-dim rounded-lg p-2.5">
                  <div className="data-label mb-1">GEAR</div>
                  <div className="text-2xl font-black font-heading text-f1-white leading-none">
                    {MOCK.gear}
                  </div>
                </div>
                <div className="bg-surface-dim rounded-lg p-2.5">
                  <div className="data-label mb-1">DRS</div>
                  <div
                    className={`text-xs font-bold font-mono ${
                      MOCK.drs ? "text-green-400" : "text-f1-silver/30"
                    }`}
                  >
                    {MOCK.drs ? "AVAILABLE" : "OFF"}
                  </div>
                </div>
              </div>

              {/* Engine temp */}
              <div className="flex justify-between items-center text-[11px]">
                <span className="data-label">ENGINE TEMP</span>
                <span className="font-mono font-bold text-f1-white">{MOCK.engineTemp}°C</span>
              </div>
            </div>

            {/* Tire status */}
            <div className="p-4 space-y-3">
              <span className="text-[11px] font-black font-heading text-f1-white tracking-wide">
                TIRE STATUS
              </span>
              <div className="flex justify-center">
                <TireIndicator tires={MOCK.tires} size={46} />
              </div>
            </div>

            {/* Brake temps */}
            <div className="p-4 space-y-2">
              <span className="text-[11px] font-black font-heading text-f1-white tracking-wide">
                BRAKE TEMP
              </span>
              <div className="space-y-1.5 text-[11px] font-mono">
                {(["fl", "fr", "rl", "rr"] as const).map((pos) => (
                  <div key={pos} className="flex justify-between">
                    <span className="text-f1-silver/50 uppercase">{pos}:</span>
                    <span className="text-f1-white font-bold">{MOCK.brakes[pos]}°C</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT AREA ── */}
          <div className="lg:col-span-9 divide-y divide-white/8">

            {/* Track live position */}
            <div className="p-5 relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold text-f1-silver/40 tracking-widest">
                  TRACK LIVE POSITION
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold text-green-500">LIVE</span>
                </div>
              </div>

              {/* Circuit + driver dot */}
              <div className="relative flex items-center justify-center py-2">
                <CircuitOutline
                  circuitName="monza"
                  glowColor={MOCK.driver.teamColor}
                  size={130}
                  strokeWidth={2.5}
                  className="w-full max-w-xs lg:max-w-sm"
                />
                {/* Driver position dot — approximately on Monza's main straight */}
                <div className="absolute" style={{ left: "67%", top: "43%" }}>
                  <div
                    className="w-3 h-3 rounded-full border-2 border-surface-dim"
                    style={{
                      backgroundColor: MOCK.driver.teamColor,
                      boxShadow: `0 0 10px ${MOCK.driver.teamColor}, 0 0 4px ${MOCK.driver.teamColor}`,
                    }}
                  />
                  <span
                    className="absolute left-4 top-0 text-[10px] font-mono font-bold whitespace-nowrap -translate-y-0.5"
                    style={{ color: MOCK.driver.teamColor }}
                  >
                    {MOCK.driver.name}
                  </span>
                </div>
              </div>

              {/* SPD + RPM mini charts */}
              <div className="grid grid-cols-2 gap-6 mt-3 pt-3 border-t border-white/5">
                <div>
                  <div className="data-label mb-1.5">SPD (KM/H)</div>
                  <TelemetryPulse color={MOCK.driver.teamColor} className="h-10" />
                </div>
                <div>
                  <div className="data-label mb-1.5 text-right">RPM</div>
                  <TelemetryPulse color={rpmColor} className="h-10" />
                </div>
              </div>
            </div>

            {/* Bottom row: Tracks + Standings */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/8">

              {/* Tracks mini panel */}
              <div className="p-4 space-y-3">
                <span className="text-[11px] font-black font-heading text-f1-white tracking-wide">
                  TRACKS
                </span>
                <div>
                  <div className="data-label mb-1">SPD (KM/H)</div>
                  <TelemetryPulse color={MOCK.driver.teamColor} className="h-8" />
                </div>
                <div
                  className="text-xs font-black font-heading"
                  style={{ color: MOCK.driver.teamColor }}
                >
                  {MOCK.driver.name}
                </div>
                <div>
                  <div className="data-label mb-1">RPM</div>
                  <TelemetryPulse color="#e10600" className="h-8" />
                </div>
              </div>

              {/* Standings table */}
              <div className="md:col-span-2 p-4">
                <span className="text-[11px] font-black font-heading text-f1-white tracking-wide block mb-3">
                  STANDINGS
                </span>
                <div className="space-y-0">
                  {/* Header row */}
                  <div className="grid grid-cols-[2rem_1fr_1fr_auto_auto] gap-x-3 pb-1.5 border-b border-white/5 mb-1.5">
                    {["POS", "DRIVER", "TEAM", "LAP TIME", "GAP"].map((h) => (
                      <span key={h} className="text-[9px] font-mono font-bold text-f1-silver/30 uppercase tracking-wider">
                        {h}
                      </span>
                    ))}
                  </div>
                  {/* Data rows */}
                  {MOCK.standings.map((row) => (
                    <React.Fragment key={row.pos}>
                      <div className="grid grid-cols-[2rem_1fr_1fr_auto_auto] gap-x-3 py-1 items-center">
                        <span className="text-[10px] font-mono text-f1-silver/50">{row.pos}</span>
                        <span className="text-[10px] font-mono font-bold text-f1-white">
                          {row.driver}
                        </span>
                        <span
                          className="text-[10px] font-mono font-bold"
                          style={{ color: row.color }}
                        >
                          {row.team}
                        </span>
                        <span className="text-[10px] font-mono text-f1-silver/70">
                          {row.lapTime}
                        </span>
                        <span className="text-[10px] font-mono text-f1-silver/50">
                          {row.gap}
                        </span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
