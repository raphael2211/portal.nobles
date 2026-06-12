import { NextResponse } from 'next/server'
import { currentSession } from '../../../lib/session'
import { portalStore } from '../../../lib/portal-store'

export async function GET() {
  const session = currentSession()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ ok: true, notifications: portalStore.listNotifications(session.userId) })
}

export async function PATCH(req: Request) {
  const session = currentSession()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as { id?: number }
  if (!body.id) return NextResponse.json({ ok: false, message: 'Notification id is required' }, { status: 400 })

  const result = portalStore.markNotification(session.userId, Number(body.id))
  if (!result.ok) return NextResponse.json(result, { status: 400 })
  return NextResponse.json(result)
}
