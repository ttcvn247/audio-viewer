import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const keys = ['ADMIN_PHONE', 'ADMIN_EMAIL', 'APP_NAME'];
    const placeholders = keys.map(() => '?').join(',');
    const settings = db.prepare(`SELECT key, value FROM settings WHERE key IN (${placeholders})`).all(...keys) as { key: string, value: string }[];
    
    const result = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Public settings read error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
