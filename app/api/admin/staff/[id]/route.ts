import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../lib/session'
import { portalStore } from '../../../../../lib/portal-store'
import type { Role, StaffStatus } from '../../../../../types/portal'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = requireAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as {
    active?: boolean
    fullName?: string
    department?: string
    title?: string
    password?: string
    role?: Role
    status?: StaffStatus
  }

  const result = portalStore.updateStaff(admin.userId, Number(params.id), body)
  if (!result.ok) return NextResponse.json(result, { status: 400 })
  return NextResponse.json(result)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = requireAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const result = portalStore.deleteStaff(admin.userId, Number(params.id))
  if (!result.ok) return NextResponse.json(result, { status: 400 })
  return NextResponse.json(result)
}
