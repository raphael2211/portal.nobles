import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/session'
import { portalStore } from '../../../../lib/portal-store'

export async function GET() {
  const admin = requireAdmin()
  if (!admin) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ ok: true, logs: portalStore.listActivityLogs() })
}
