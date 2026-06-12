import { NextResponse } from 'next/server'
import { currentSession } from '../../../lib/session'
import { portalStore } from '../../../lib/portal-store'

export async function GET() {
  const session = currentSession()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  if (!portalStore.userHasPermission(session.userId, 'attendance.view')) {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
  }

  const attendance = portalStore.listAttendance(session.userId)
  return NextResponse.json({ ok: true, ...attendance })
}

export async function POST(req: Request) {
  const session = currentSession()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  if (!portalStore.userHasPermission(session.userId, 'attendance.check_in')) {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as {
    action?: 'check_in' | 'check_out'
    latitude?: number
    longitude?: number
    accuracyMeters?: number
    note?: string
  }

  const payload = {
    latitude: body.latitude,
    longitude: body.longitude,
    accuracyMeters: body.accuracyMeters,
    note: body.note,
  }
  const result = body.action === 'check_out' ? portalStore.checkOutAttendance(session.userId, payload) : portalStore.checkInAttendance(session.userId, payload)

  if (!result.ok) return NextResponse.json(result, { status: 400 })
  return NextResponse.json(result)
}
