import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken, setTokenCookie } from '../../../../lib/auth';
import { Role } from '../../../../types/portal'; // 👈 import your local Role type

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { staffId?: string; password?: string };
    const staffId = body.staffId?.trim().toUpperCase();
    const password = body.password || '';

    if (!staffId || !password) {
      return NextResponse.json({ ok: false, message: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { staffId },
    });

    if (!user) {
      return NextResponse.json({ ok: false, message: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ ok: false, message: 'Account disabled' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ ok: false, message: 'Invalid credentials' }, { status: 401 });
    }

    const { passwordHash: _, ...userWithoutHash } = user;

    //  cast user.role to Role type
    const token = signToken({ userId: user.id, role: user.role as Role });
    const res = NextResponse.json({ ok: true, user: userWithoutHash });
    setTokenCookie(res, token);
    return res;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ ok: false, message: 'Server error' }, { status: 500 });
  }
}