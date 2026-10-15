import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { key, value } = await request.json();

    if (!key || value === undefined) {
      return new NextResponse('Missing key or value', { status: 400 });
    }

    const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    stmt.run(key, value);

    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error('Settings save error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const settings = db.prepare('SELECT * FROM settings').all() as { key: string, value: string }[];
    const result = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Settings read error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
