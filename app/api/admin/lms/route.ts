import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/session'
import { portalStore } from '../../../../lib/portal-store'
import type { CourseType } from '../../../../types/portal'

export async function GET() {
  const admin = requireAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ ok: true, courses: portalStore.listCourses() })
}

export async function POST(req: Request) {
  const admin = requireAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as {
    title?: string
    description?: string
    type?: CourseType
    resourceUrl?: string
    durationMinutes?: number
  }

  const result = portalStore.createCourse(admin.userId, {
    title: body.title || '',
    description: body.description || '',
    type: body.type || 'manual',
    resourceUrl: body.resourceUrl || '',
    durationMinutes: Number(body.durationMinutes || 0),
  })

  if (!result.ok) return NextResponse.json(result, { status: 400 })
  return NextResponse.json(result)
}
