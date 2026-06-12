'use client'

import React from 'react'
import type { PublicPortalUser } from '../../types/portal'
import { formatCurrency, kpiRewardValue, progressPercent } from '../../lib/kpi'

export default function StaffAnalyticsTable({ staff }: { staff: PublicPortalUser[] }) {
  return (
    <section className="panel">
      <div className="section-kicker">Monthly rankings</div>
      <h3 className="section-title mt-1">Staff performance analytics</h3>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
        <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:grid">
          <div>Staff</div>
          <div>KPI</div>
          <div>Progress</div>
          <div>Reward</div>
        </div>
        <div className="divide-y divide-slate-100 bg-white/[0.70]">
          {staff.map((user) => (
            <div key={user.id} className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1.5fr_1fr_1fr_1fr] md:items-center">
              <div>
                <div className="font-semibold text-[#0B1F3A]">{user.fullName}</div>
                <div className="text-xs text-slate-500">{user.department || 'Operations'} / {user.staffId}</div>
              </div>
              <div className="font-semibold text-[#0B1F3A]">{user.kpi} pts</div>
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#0B1F3A] to-[#C8A96B]" style={{ width: `${progressPercent(user.kpi)}%` }} />
                </div>
              </div>
              <div className="font-semibold text-[#0B1F3A]">{formatCurrency(kpiRewardValue(user.kpi))}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
