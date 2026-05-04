/**
 * Years API Route
 * Returns available F1 seasons from OpenF1 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAvailableYears } from '@/lib/api/openf1';

export async function GET() {
  try {
    const years = await getAvailableYears();
    return NextResponse.json({ success: true, years });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch years' },
      { status: 500 }
    );
  }
}