/**
 * Power Unit Component Usage API Route
 * Fetches real F1 PU data via AI API (NVIDIA or OpenRouter)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAiClient } from '@/lib/api/openrouter';

// PU Usage schema
const PU_USAGE_SCHEMA = {
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
          components: {
            type: 'object',
            properties: {
              ice: { type: 'number' },
              turbo: { type: 'number' },
              mguh: { type: 'number' },
              mguk: { type: 'number' },
              es: { type: 'number' },
              ce: { type: 'number' },
              exhaust: { type: 'number' },
            },
            required: ['ice', 'turbo', 'mguh', 'mguk', 'es', 'ce', 'exhaust'],
          },
          penalties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                component: { type: 'string' },
                grandPrix: { type: 'string' },
                gridPenalty: { type: 'number' },
              },
              required: ['component', 'grandPrix', 'gridPenalty'],
            },
          },
        },
        required: [
          'driverNumber',
          'nameAcronym',
          'fullName',
          'team',
          'teamColour',
          'components',
          'penalties',
        ],
      },
    },
  },
  required: ['drivers'],
};

export async function GET(request: NextRequest) {
  const client = createAiClient();

  const keyStatus = client.getApiKeyStatus();
  if (!keyStatus.configured) {
    return NextResponse.json(
      { success: false, error: 'No AI API key configured. Add NVIDIA_API_KEY to .env.local' },
      { status: 500 }
    );
  }

  // Check for optional driver_number filter
  const driverNumber = request.nextUrl.searchParams.get('driver_number');

  const prompt = `Search the web for the latest Formula 1 2026 season power unit (PU) component usage data for each driver.

In F1, each driver is allocated per season:
- 4 ICE (Internal Combustion Engine)
- 4 Turbo (Turbocharger)
- 4 MGU-H (Motor Generator Unit - Heat)
- 4 MGU-K (Motor Generator Unit - Kinetic)
- 2 ES (Energy Store)
- 2 CE (Control Electronics)
- 8 Exhaust

For each of the current 22 F1 drivers (11 teams — Cadillac/GM joined as the 11th team in 2026), provide:
- driverNumber: Their race number
- nameAcronym: Their 3-letter abbreviation
- fullName: Their full name
- team: The F1 team they drive for
- teamColour: Their team's primary hex color code
- components: The count of each PU component USED so far this season (not remaining)
- penalties: Any grid penalties incurred for exceeding component limits, including which component caused it, which grand prix it was at, and the number of grid places penalized

${driverNumber ? `Only return data for driver number ${driverNumber}.` : ''}

FIA publishes these component usage records regularly throughout the season. Search for the latest available data.

Return a JSON object with a "drivers" array.`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await client.fetchStructuredData<{ drivers: any[] }>(
    prompt,
    PU_USAGE_SCHEMA
  );

  if (result.success && result.data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drivers = driverNumber
      ? result.data.drivers.filter((d: { driverNumber: number }) => d.driverNumber === parseInt(driverNumber))
      : result.data.drivers;

    return NextResponse.json({
      success: true,
      drivers,
      source: result.source,
      cachedAt: result.cachedAt,
    });
  }

  return NextResponse.json(
    { success: false, error: result.error || 'Failed to fetch PU data' },
    { status: 502 }
  );
}
