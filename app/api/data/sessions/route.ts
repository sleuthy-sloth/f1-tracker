/**
 * Sessions API Route
 * Returns F1 sessions for a given year from OpenF1 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessions } from '@/lib/api/openf1';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  
  if (!year) {
    return NextResponse.json(
      { success: false, error: 'Missing year parameter' },
      { status: 400 }
    );
  }
  
  try {
    const parsedYear = parseInt(year);
    if (isNaN(parsedYear)) {
      return NextResponse.json(
        { success: false, error: 'Invalid year parameter' },
        { status: 400 }
      );
    }
    
    const sessions = await getSessions({ year: parsedYear });
    return NextResponse.json({ success: true, sessions });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}