import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';   // adjust path
import bcrypt from 'bcryptjs';
import { signToken, setTokenCookie } from '../../../../lib/auth';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { staffId?: string; password?: string };
    const staffId = body.staffId?.trim().toUpperCase();
    const password = body.password || '';

    if (!staffId || !password) {
      return NextResponse.json({ ok: false, message: 'Missing credentials' }, { status: 400 });
    }

    // 1. Find user by staffId (case‑insensitive)
    const user = await prisma.user.findUnique({
      where: { staffId },
    });

    if (!user) {
      return NextResponse.json({ ok: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Check if account is active
    if (!user.active) {
      return NextResponse.json({ ok: false, message: 'Account disabled' }, { status: 403 });
    }

    // 3. Compare password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ ok: false, message: 'Invalid credentials' }, { status: 401 });
    }

    // 4. Prepare user object (without passwordHash) for response
    const { passwordHash: _, ...userWithoutHash } = user;

    // 5. Generate token and set cookie
    const token = signToken({ userId: user.id, role: user.role });
    const res = NextResponse.json({ ok: true, user: userWithoutHash });
    setTokenCookie(res, token);
    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ ok: false, message: 'Server error' }, { status: 500 });
  }
}