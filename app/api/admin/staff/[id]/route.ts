import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/session';
import { prisma } from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import type { Role, StaffStatus } from '../../../../../types/portal';

// PATCH /api/admin/staff/[id] – update staff member
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as {
    active?: boolean;
    fullName?: string;
    department?: string;
    title?: string;       // note: 'title' may not exist in User model – ignore or add later
    password?: string;
    role?: Role;
    status?: StaffStatus; // 'active' or 'inactive'
  };

  const userId = Number(params.id);
  if (isNaN(userId)) {
    return NextResponse.json({ ok: false, message: 'Invalid user ID' }, { status: 400 });
  }

  // Prepare update data
  const updateData: any = {};

  if (body.fullName !== undefined) updateData.fullName = body.fullName;
  if (body.department !== undefined) updateData.department = body.department;
  if (body.role !== undefined) updateData.role = body.role;
  if (body.active !== undefined) updateData.active = body.active;
  if (body.status !== undefined) updateData.active = body.status === 'active';
  
  // If password is provided, hash it
  if (body.password) {
    updateData.passwordHash = await bcrypt.hash(body.password, 10);
  }

  // title field is not in your User model – you can either ignore it or add a 'title' column to schema
  // For now, we ignore 'title'

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        staffId: true,
        fullName: true,
        department: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    // Return transformed object (frontend expects 'status' instead of 'active')
    return NextResponse.json({
      ok: true,
      staff: {
        ...updated,
        status: updated.active ? 'active' : 'inactive',
      },
    });
  } catch (error: any) {
    console.error('PATCH staff error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ ok: false, message: 'Staff not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/staff/[id] – remove staff member
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const admin = requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });

  const userId = Number(params.id);
  if (isNaN(userId)) {
    return NextResponse.json({ ok: false, message: 'Invalid user ID' }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ ok: true, message: 'Staff deleted successfully' });
  } catch (error: any) {
    console.error('DELETE staff error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ ok: false, message: 'Staff not found' }, { status: 404 });
    }
    // Foreign key constraint – you have related tables (assignments, kpiRecords, etc.)
    if (error.code === 'P2003') {
      return NextResponse.json({ 
        ok: false, 
        message: 'Cannot delete staff with existing records (attendance, assignments, etc.). Consider deactivating instead.' 
      }, { status: 409 });
    }
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
  }
}