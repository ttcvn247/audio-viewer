import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

// Get all users
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const users = db.prepare('SELECT email FROM users ORDER BY email ASC').all();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ message: 'Missing fields' }, { status: 400 });

    const existingUser = db.prepare('SELECT email FROM users WHERE email = ?').get(email);
    if (existingUser) return NextResponse.json({ message: 'Email already exists' }, { status: 400 });

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, hashedPassword);

    return NextResponse.json({ message: 'User created' });
  } catch (error) {
    console.error('Create user error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Update password (Reset)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const { email, newPassword } = await request.json();
    if (!email || !newPassword) return NextResponse.json({ message: 'Missing fields' }, { status: 400 });

    const adminEmailSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('ADMIN_EMAIL') as { value: string };
    const adminEmail = adminEmailSetting?.value || 'phuongvb@mobifoneservice.com.vn';

    if (email === adminEmail) {
      return NextResponse.json({ message: 'Không thể reset mật khẩu của Admin. Vui lòng dùng tính năng Đổi mật khẩu cá nhân.' }, { status: 403 });
    }

    const existingUser = db.prepare('SELECT email FROM users WHERE email = ?').get(email);
    if (!existingUser) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hashedPassword, email);

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Delete user
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse('Unauthorized', { status: 401 });

    const { email } = await request.json();
    if (!email) return NextResponse.json({ message: 'Missing email' }, { status: 400 });

    const adminEmailSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('ADMIN_EMAIL') as { value: string };
    const adminEmail = adminEmailSetting?.value || 'phuongvb@mobifoneservice.com.vn';

    if (email === adminEmail) {
      return NextResponse.json({ message: 'Không thể xóa tài khoản Admin.' }, { status: 403 });
    }
    
    // Prevent deleting the currently logged-in user
    if (email === session.user.email) return NextResponse.json({ message: 'Không thể tự xóa chính mình' }, { status: 400 });

    db.prepare('DELETE FROM users WHERE email = ?').run(email);

    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
