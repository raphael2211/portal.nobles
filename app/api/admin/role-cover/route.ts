import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/session'
import { portalStore } from '../../../../lib/portal-store'
import type { ReadinessLevel } from '../../../../types/portal'

export async function GET() {
  const admin = requireAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ ok: true, entries: portalStore.listRoleCover() })
}

export async function POST(req: Request) {
  const admin = requireAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as {
    id?: number
    functionName?: string
    primaryUserId?: number
    backupUserId?: number
    readiness?: ReadinessLevel
    temporaryPermissions?: string
  }

  if (!body.functionName || !body.primaryUserId || !body.backupUserId) {
    return NextResponse.json({ ok: false, message: 'Function, primary, and backup are required' }, { status: 400 })
  }

  const result = portalStore.upsertRoleCover(admin.userId, {
    id: body.id,
    functionName: body.functionName,
    primaryUserId: Number(body.primaryUserId),
    backupUserId: Number(body.backupUserId),
    readiness: body.readiness || 'Training',
    temporaryPermissions: body.temporaryPermissions || '',
  })

  if (!result.ok) return NextResponse.json(result, { status: 400 })
  return NextResponse.json(result)
}
