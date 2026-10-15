import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return new NextResponse('Thiếu thông tin mật khẩu', { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(session.user.email) as any;
    if (!user) {
      return new NextResponse('Không tìm thấy người dùng', { status: 404 });
    }

    const isValid = bcrypt.compareSync(oldPassword, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Mật khẩu cũ không chính xác' }, { status: 400 });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(newHash, session.user.email);

    return NextResponse.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Password change error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
