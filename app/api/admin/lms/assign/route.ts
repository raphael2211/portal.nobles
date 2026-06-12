import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../lib/session'
import { portalStore } from '../../../../../lib/portal-store'

export async function POST(req: Request) {
  const admin = requireAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as { courseId?: number; userId?: number }
  if (!body.courseId || !body.userId) {
    return NextResponse.json({ ok: false, message: 'Course and staff are required' }, { status: 400 })
  }

  const result = portalStore.assignCourse(admin.userId, Number(body.courseId), Number(body.userId))
  if (!result.ok) return NextResponse.json(result, { status: 400 })
  return NextResponse.json(result)
}
