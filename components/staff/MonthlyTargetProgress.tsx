'use client'

import React from 'react'
import { progressPercent } from '../../lib/kpi'

export default function MonthlyTargetProgress({ kpi }: { kpi: number }) {
  const progress = progressPercent(kpi)
  const remaining = Math.max(0, 100 - kpi)

  return (
    <section className="panel">
      <div className="section-kicker">Cycle target</div>
      <h3 className="section-title mt-1">Monthly target progress</h3>
      <div className="mt-6 flex items-end justify-between">
        <div>
          <div className="text-4xl font-semibold tracking-normal text-[#0B1F3A]">{progress.toFixed(0)}%</div>
          <div className="mt-2 text-sm text-slate-500">{remaining} KPI remaining to target</div>
        </div>
        <div className="text-right text-sm text-slate-500">
          <div>Target</div>
          <div className="font-semibold text-[#0B1F3A]">100 KPI</div>
        </div>
      </div>
    </section>
  )
}
