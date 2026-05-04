/**
 * Drivers API Route
 * Returns F1 drivers for a given session from OpenF1 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDrivers } from '@/lib/api/openf1';

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
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drivers = await (getDrivers as any)({ session_key: parsedKey });
    return NextResponse.json({ success: true, drivers });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}