import { NextRequest, NextResponse } from 'next/server';
import { activateLicenseKey } from '@/lib/license';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json({ success: false, error: 'Vui lòng cung cấp mã kích hoạt.' }, { status: 400 });
    }

    const result = activateLicenseKey(key);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('License activation error:', error);
    return NextResponse.json({ success: false, error: 'Đã xảy ra lỗi trong quá trình kích hoạt.' }, { status: 500 });
  }
}
