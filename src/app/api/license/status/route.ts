import { NextResponse } from 'next/server';
import { getLicenseStatus } from '@/lib/license';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = getLicenseStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('License status error:', error);
    return NextResponse.json({ error: 'Failed to retrieve license status' }, { status: 500 });
  }
}
