/**
 * Podium API Route
 * Returns top 3 drivers for a given session_key
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionResult } from '@/lib/api/openf1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionKey = searchParams.get('session_key');
  
  if (!sessionKey) {
    return NextResponse.json(
      { success: false, error: 'Missing session_key parameter' },
      { status: 400 }
    );
  }
  
  try {
    const parsedKey = parseInt(sessionKey);
    if (isNaN(parsedKey)) {
      return NextResponse.json(
        { success: false, error: 'Invalid session_key parameter' },
        { status: 400 }
      );
    }
    
    const results = await getSessionResult({ session_key: parsedKey });
    
    // Transform to PodiumEntry format
    const podium = results
      .filter((r) => r.position >= 1 && r.position <= 3)
      .sort((a, b) => a.position - b.position)
      .map((r) => ({
        position: r.position,
        driver_name: `#${r.driver_number}`,
        driver_number: r.driver_number,
      }));
      
    return NextResponse.json({ success: true, podium });
  } catch (error) {
    console.error('Podium API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch podium data' },
      { status: 500 }
    );
  }
}
