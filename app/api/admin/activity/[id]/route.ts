import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../../lib/session'
import { portalStore } from '../../../../../lib/portal-store'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = requireAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as {
    decision?: 'reward' | 'penalty' | 'reject'
    points?: number
    note?: string
  }

  if (!body.decision) {
    return NextResponse.json({ ok: false, message: 'Review decision is required' }, { status: 400 })
  }

  const result = portalStore.reviewActivityLog(admin.userId, Number(params.id), {
    decision: body.decision,
    points: body.points,
    note: body.note,
  })

  if (!result.ok) return NextResponse.json(result, { status: 400 })
  return NextResponse.json(result)
}
