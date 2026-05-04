/**
 * Fantasy Driver Data API Route
 * Fetches real F1 driver data via OpenRouter with web search
 */

import { NextResponse } from 'next/server';
import { createAiClient } from '@/lib/api/openrouter';

export async function GET() {
  const client = createAiClient();

  const keyStatus = client.getApiKeyStatus();
  if (!keyStatus.configured) {
    return NextResponse.json(
      { success: false, error: 'No AI API key configured. Add NVIDIA_API_KEY to .env.local' },
      { status: 500 }
    );
  }

  // 2. Define the expected JSON schema
  const schema = {
    type: 'object',
    properties: {
      drivers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            driverNumber: { type: 'number' },
            nameAcronym: { type: 'string' },
            fullName: { type: 'string' },
            team: { type: 'string' },
            teamColour: { type: 'string' },
            cost: { type: 'number' },
            points: { type: 'number' },
          },
          required: ['driverNumber', 'nameAcronym', 'fullName', 'team', 'teamColour', 'cost', 'points']
        }
      }
    },
    required: ['drivers']
  };

  // 3. Prompt for OpenRouter with web search
  const prompt = `Search the web for the current Formula 1 2026 season driver lineup, team colors, and fantasy-relevant data.

For each driver on the 2026 F1 grid, provide:
- driverNumber: Their race number
- nameAcronym: Their 3-letter abbreviation (e.g., VER, HAM, LEC)
- fullName: Their full name
- team: The F1 team they drive for
- teamColour: Their team's primary color as a hex code (e.g., Ferrari = #E8002D, Red Bull = #3671C6, Mercedes = #27F4D2, McLaren = #FF8000, Aston Martin = #00594F, Alpine = #FF87BC, Williams = #005AFF, RB = #4E7FCD, Haas = #B6BABD, Sauber = #00E700, Cadillac = #C8C9CB)
- cost: A fantasy-style cost value between 5.0 and 40.0, reflecting driver skill and team performance (top drivers like Verstappen ~35-40, midfield ~15-25, rookies ~5-12)
- points: Current season championship points as of the most recent race

Return a JSON object with a "drivers" array containing all 22 current F1 drivers for the 2026 season across all 11 teams (Cadillac/GM joined as the 11th team in 2026).`;

  // 4. Fetch data with web search
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await client.fetchStructuredData<{ drivers: any[] }>(prompt, schema, {
    searchContextSize: 'medium',
  });

  // 5. Return response
  if (result.success && result.data) {
    return NextResponse.json({
      success: true,
      drivers: result.data.drivers,
      source: result.source,
      cachedAt: result.cachedAt,
    });
  }

  // 6. Fallback error
  return NextResponse.json(
    { success: false, error: result.error || 'Failed to fetch driver data' },
    { status: 502 }
  );
}