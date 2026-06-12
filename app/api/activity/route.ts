import { NextResponse } from 'next/server'
import { currentSession } from '../../../lib/session'
import { portalStore } from '../../../lib/portal-store'
import type { ActivityEvidence } from '../../../types/portal'

export async function GET() {
  const session = currentSession()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  if (!portalStore.userHasPermission(session.userId, 'activity.view')) {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
  }
  const logs = portalStore.listActivityLogs(session.userId)
  return NextResponse.json({ ok: true, logs })
}

export async function POST(req: Request) {
  const session = currentSession()
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }
  if (!portalStore.userHasPermission(session.userId, 'activity.create')) {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as {
    summary?: string
    tomorrowTodo?: string
    evidence?: ActivityEvidence[]
  }

  const result = portalStore.createActivityLog(session.userId, {
    summary: body.summary || '',
    tomorrowTodo: body.tomorrowTodo || '',
    evidence: body.evidence || [],
  })

  if (!result.ok) return NextResponse.json(result, { status: 400 })
  return NextResponse.json(result)
}
