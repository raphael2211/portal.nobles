'use client'

import React, { useState } from 'react'
import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react'
import type { ActivityLog, PublicPortalUser } from '../../types/portal'
import { DAILY_MAX } from '../../lib/kpi'
import Button from '../shared/Button'
import StatusBadge from '../shared/StatusBadge'

export default function KPIApprovalCard({
  log,
  staff,
  onReview,
}: {
  log: ActivityLog
  staff?: PublicPortalUser
  onReview: (logId: number, payload: { decision: 'reward' | 'penalty' | 'reject'; points?: number; note?: string }) => Promise<{ ok: boolean; message?: string }>
}) {
  const [points, setPoints] = useState(10)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (decision: 'reward' | 'penalty' | 'reject') => {
    setLoading(true)
    setError(null)
    const result = await onReview(log.id, {
      decision,
      points: decision === 'reject' ? 0 : points,
      note,
    })
    setLoading(false)
    if (!result.ok) setError(result.message || 'Review failed')
  }

  return (
    <article className="rounded-2xl border border-slate-100 bg-white/[0.82] p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-semibold text-[#0B1F3A]">{staff?.fullName || 'Staff member'}</div>
            <StatusBadge value={log.status} />
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{log.summary}</p>
          <div className="mt-3 rounded-2xl bg-[#F8F5EF] p-3 text-sm text-[#5F4A25]">
            <span className="font-semibold">Tomorrow:</span> {log.tomorrowTodo}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {log.evidence.map((item) => (
              <span key={item.id} className="rounded-full bg-[#C8A96B]/[0.12] px-3 py-1 text-xs font-semibold text-[#0B1F3A]">
                {item.type}: {item.value.length > 34 ? `${item.value.slice(0, 34)}...` : item.value}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full shrink-0 rounded-2xl border border-slate-100 bg-slate-50/[0.70] p-3 lg:w-64">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">KPI points</span>
            <input
              type="number"
              min={0}
              max={DAILY_MAX}
              value={points}
              onChange={(event) => setPoints(Math.min(DAILY_MAX, Math.max(0, Number(event.target.value))))}
              className="mt-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
            />
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Review note"
            className="mt-2 min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
          />
          {error && <div className="mt-2 text-xs font-medium text-rose-600">{error}</div>}
          <div className="mt-3 grid gap-2">
            <Button type="button" disabled={loading} onClick={() => submit('reward')}>
              <CheckCircle2 className="h-4 w-4" />
              Reward
            </Button>
            <Button type="button" variant="secondary" disabled={loading} onClick={() => submit('penalty')}>
              <MinusCircle className="h-4 w-4" />
              Penalize
            </Button>
            <Button type="button" variant="ghost" disabled={loading} onClick={() => submit('reject')}>
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
