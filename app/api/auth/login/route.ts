import { NextResponse } from 'next/server'
import { portalStore } from '../../../../lib/portal-store'
import { signToken, setTokenCookie } from '../../../../lib/auth'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { staffId?: string; password?: string }
    const staffId = body.staffId?.trim().toUpperCase()
    const password = body.password || ''
    if (!staffId || !password) {
      return NextResponse.json({ ok: false, message: 'Missing credentials' }, { status: 400 })
    }

    const result = portalStore.authenticate(staffId, password)
    if (!result.ok) {
      const status = result.message.startsWith('Account disabled') ? 403 : 401
      return NextResponse.json({ ok: false, message: result.message }, { status })
    }

    const token = signToken({ userId: result.user.id, role: result.user.role })
    const res = NextResponse.json({ ok: true, user: result.user })
    setTokenCookie(res, token)
    return res
  } catch (err) {
    return NextResponse.json({ ok: false, message: 'Server error' }, { status: 500 })
  }
}
