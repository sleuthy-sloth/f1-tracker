/**
 * Circuit Layout and Name Resolution Utilities
 * 
 * This file contains data for circuit SVG outlines and logic to map
 * OpenF1 circuit names to these internal keys.
 */

// Built-in simplified circuit paths (approximate SVG outlines, viewBox 0 0 100 100)
export const CIRCUIT_PATHS: Record<string, string> = {
  "monza":        "M60 20 Q80 5 100 15 Q120 25 115 45 Q110 60 90 65 Q70 70 60 85 Q50 100 35 95 Q20 90 25 70 Q30 50 45 40 Q55 30 60 20Z",
  "monaco":       "M30 15 L50 10 L70 20 L80 40 L75 55 L60 65 L45 60 L35 45 L25 35 L20 25Z",
  "spa":          "M20 30 Q40 10 65 15 Q85 20 90 40 Q95 60 80 75 Q65 85 45 80 Q30 70 25 55 Q20 40 20 30Z",
  "silverstone":  "M40 10 Q65 5 80 20 Q95 35 85 55 Q75 70 55 75 Q35 80 20 65 Q10 50 15 30 Q25 15 40 10Z",
  "suzuka":       "M25 15 Q50 5 70 15 Q85 25 90 45 Q85 65 65 75 Q45 80 30 65 Q20 50 25 30Z",
  "interlagos":   "M50 5 Q70 10 80 30 Q85 50 70 65 Q55 75 35 70 Q20 60 15 40 Q15 20 35 10Z",
  "red_bull_ring":"M30 15 L60 10 L85 20 L90 45 L75 65 L50 75 L25 65 L15 40Z",
  "yas_marina":   "M15 35 Q30 15 55 10 Q80 10 90 30 Q95 50 80 65 Q65 75 45 70 Q30 65 20 50Z",
  "marina_bay":   "M25 10 L55 5 L80 15 L90 35 L85 55 L60 65 L35 60 L15 45 L10 25Z",
  "catalunya":    "M35 10 Q60 5 80 20 Q95 35 85 55 Q70 70 50 75 Q30 80 15 60 Q10 40 20 20Z",
  "bahrain":      "M20 50 Q15 30 30 15 Q50 5 70 15 Q88 25 90 45 Q92 62 78 72 Q65 80 50 75 Q35 80 28 68 Q20 68 20 50Z",
  "jeddah":       "M15 20 L25 8 L75 8 L88 20 L90 50 L85 72 L70 82 L30 82 L15 70 L10 50Z",
  "albert_park":  "M30 10 Q55 5 75 15 Q90 25 92 45 Q90 65 72 75 Q55 82 35 75 Q15 65 12 45 Q12 25 30 10Z",
  "shanghai":     "M20 25 Q35 8 65 10 Q88 15 92 40 Q92 65 70 78 Q50 85 30 75 Q12 65 12 42 Q14 30 20 25Z",
  "miami":        "M20 40 Q18 18 45 10 Q72 5 85 25 Q95 42 85 60 Q75 75 55 80 Q35 82 22 68 Q18 58 20 40Z",
  "imola":        "M15 45 Q12 25 30 12 Q52 5 72 18 Q88 30 85 52 Q82 70 65 78 Q45 85 28 75 Q14 65 15 45Z",
  "baku":         "M20 15 L50 8 L80 15 L88 40 L82 65 L60 80 L38 80 L18 65 L12 40Z",
  "zandvoort":    "M30 12 Q55 5 75 18 Q90 30 88 52 Q85 70 68 78 Q48 85 28 75 Q10 65 10 45 Q10 25 30 12Z",
  "cota":         "M15 50 Q12 28 32 14 Q54 5 76 16 Q92 28 90 50 Q88 70 70 80 Q50 88 30 78 Q12 68 15 50Z",
  "mexico":       "M25 18 Q50 8 75 16 Q90 28 88 50 Q88 68 72 78 Q52 86 32 76 Q14 66 14 46 Q14 28 25 18Z",
  "hungaroring":  "M22 48 Q20 26 40 12 Q62 5 80 20 Q94 34 90 56 Q86 74 66 80 Q46 86 28 74 Q20 64 22 48Z",
  "losail":       "M18 42 Q16 22 36 10 Q58 4 78 16 Q92 28 90 50 Q88 70 70 80 Q50 88 30 78 Q14 66 18 42Z",
  "las_vegas":    "M10 50 L10 20 L90 20 L90 80 L10 80Z",
  "default":      "M20 20 L80 20 L90 50 L70 80 L30 80 L10 50Z",
};

// Map from OpenF1 circuit_short_name (and common aliases) to a CIRCUIT_PATHS key
export const CIRCUIT_NAME_MAP: Record<string, string> = {
  "monza": "monza", "autodromo nazionale monza": "monza",
  "monaco": "monaco", "monte carlo": "monaco",
  "spa": "spa", "spa-francorchamps": "spa", "circuit de spa-francorchamps": "spa",
  "silverstone": "silverstone",
  "suzuka": "suzuka",
  "interlagos": "interlagos", "são paulo": "interlagos",
  "red bull ring": "red_bull_ring",
  "yas marina": "yas_marina", "abu dhabi": "yas_marina",
  "marina bay": "marina_bay", "singapore": "marina_bay",
  "barcelona": "catalunya", "barcelona-catalunya": "catalunya", "circuit de barcelona-catalunya": "catalunya",
  "sakhir": "bahrain", "bahrain": "bahrain",
  "jeddah": "jeddah",
  "melbourne": "albert_park", "albert park": "albert_park",
  "shanghai": "shanghai",
  "miami": "miami",
  "imola": "imola",
  "baku": "baku",
  "zandvoort": "zandvoort",
  "austin": "cota", "cota": "cota", "circuit of the americas": "cota",
  "mexico city": "mexico", "mexico": "mexico",
  "budapest": "hungaroring", "hungaroring": "hungaroring",
  "losail": "losail", "qatar": "losail",
  "las vegas": "las_vegas",
};

/** Resolve an OpenF1 circuit_short_name to a CIRCUIT_PATHS key */
export function resolveCircuitKey(shortName: string): string {
  if (!shortName) return "default";
  const normalized = shortName.toLowerCase().trim();
  return CIRCUIT_NAME_MAP[normalized] ?? normalized;
}
