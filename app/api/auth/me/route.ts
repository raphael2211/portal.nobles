import { NextResponse } from 'next/server'
import { currentUser } from '../../../../lib/session'

export async function GET() {
  const user = currentUser()
  if (!user || !user.active) return NextResponse.json({ ok: false, user: null })
  return NextResponse.json({ ok: true, user })
}
