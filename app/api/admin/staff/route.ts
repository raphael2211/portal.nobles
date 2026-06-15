import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/session';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import type { Role, StaffStatus } from '../../../../types/portal';

// GET: list all staff (users)
export async function GET() {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      staffId: true,
      fullName: true,
      department: true,
      role: true,
      active: true,     // maps to status (active = true -> 'active', false -> 'inactive')
      createdAt: true,
      // You might also want points, kpi, etc.
    },
    orderBy: { createdAt: 'desc' },
  });

  // Transform to match your frontend expected shape (if needed)
  const staffList = users.map(user => ({
    id: user.id,
    staffId: user.staffId,
    fullName: user.fullName,
    department: user.department,
    role: user.role,
    status: user.active ? 'active' : 'inactive' as StaffStatus,
    createdAt: user.createdAt,
  }));

  return NextResponse.json({ ok: true, users: staffList });
}

// POST: create a new staff member
export async function POST(req: Request) {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as {
    staffId?: string;
    fullName?: string;
    password?: string;
    department?: string;
    title?: string;
    role?: Role;
    status?: StaffStatus;
  };

  if (!body.staffId || !body.fullName || !body.password) {
    return NextResponse.json({ ok: false, message: 'Missing fields' }, { status: 400 });
  }

  // Check if staffId already exists
  const existing = await prisma.user.findUnique({ where: { staffId: body.staffId } });
  if (existing) {
    return NextResponse.json({ ok: false, message: 'Staff ID already exists' }, { status: 409 });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(body.password, 10);

  // Create the user
  const newUser = await prisma.user.create({
    data: {
      staffId: body.staffId,
      fullName: body.fullName,
      passwordHash: hashedPassword,
      department: body.department,
      role: body.role || 'staff',
      active: body.status === 'ACTIVE' ? true : (body.status === 'INACTIVE' ? false : true),
      // title field might not be in your User model – ignore or add later
      // kpi and points default to 0 (already set in schema)
    },
  });

  // Return the created staff (without password)
  return NextResponse.json({
    ok: true,
    staff: {
      id: newUser.id,
      staffId: newUser.staffId,
      fullName: newUser.fullName,
      department: newUser.department,
      role: newUser.role,
      status: newUser.active ? 'active' : 'inactive',
    },
  });
}