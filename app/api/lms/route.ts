import { NextResponse } from 'next/server'
import { currentSession } from '../../../lib/session'
import { portalStore } from '../../../lib/portal-store'

export async function GET() {
  const session = currentSession()
  if (!session) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  if (!portalStore.userHasPermission(session.userId, 'lms.view')) {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
  }
  return NextResponse.json({ ok: true, courses: portalStore.listAssignedCourses(session.userId) })
}

export async function PATCH(req: Request) {
  const session = currentSession()
  if (!session) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  }
  if (!portalStore.userHasPermission(session.userId, 'lms.view')) {
    return NextResponse.json({ ok: false, message: 'Forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as { assignmentId?: number; progress?: number }
  if (!body.assignmentId && body.assignmentId !== 0) {
    return NextResponse.json({ ok: false, message: 'Assignment id is required' }, { status: 400 })
  }

  const result = portalStore.updateCourseProgress(session.userId, Number(body.assignmentId), Number(body.progress || 0))
  if (!result.ok) return NextResponse.json(result, { status: 400 })
  return NextResponse.json(result)
}
