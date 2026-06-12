import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/session'
import { portalStore } from '../../../../lib/portal-store'
import type { Role, StaffStatus } from '../../../../types/portal'

export async function GET() {
  const admin = requireAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ ok: true, users: portalStore.listUsers() })
}

export async function POST(req: Request) {
  const admin = requireAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as {
    staffId?: string
    fullName?: string
    password?: string
    department?: string
    title?: string
    role?: Role
    status?: StaffStatus
  }

  if (!body.staffId || !body.fullName || !body.password) {
    return NextResponse.json({ ok: false, message: 'Missing fields' }, { status: 400 })
  }

  const result = portalStore.createStaff(admin.userId, {
    staffId: body.staffId,
    fullName: body.fullName,
    password: body.password,
    department: body.department,
    title: body.title,
    role: body.role,
    status: body.status,
  })

  if (!result.ok) return NextResponse.json(result, { status: 409 })
  return NextResponse.json(result)
}
