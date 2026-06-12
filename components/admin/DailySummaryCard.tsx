'use client'

import React from 'react'
import { CalendarDays } from 'lucide-react'
import type { SummaryMetrics } from '../../types/portal'

export default function DailySummaryCard({ summary }: { summary: SummaryMetrics }) {
  return <SummaryCard title="Daily summary" summary={summary} icon={<CalendarDays className="h-5 w-5" />} />
}

export function SummaryCard({ title, summary, icon }: { title: string; summary: SummaryMetrics; icon: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="flex items-center justify-between">
        <div>
          <div className="section-kicker">{title}</div>
          <div className="mt-2 text-3xl font-semibold text-[#0B1F3A]">{summary.rewards}</div>
          <div className="text-sm text-slate-500">KPI rewarded</div>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#C8A96B]/[0.12] text-[#0B1F3A]">{icon}</div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-slate-50 p-2">
          <div className="font-semibold text-slate-900">{summary.logs}</div>
          <div className="text-slate-500">Logs</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <div className="font-semibold text-slate-900">{summary.pending}</div>
          <div className="text-slate-500">Pending</div>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <div className="font-semibold text-slate-900">{summary.verificationRate}%</div>
          <div className="text-slate-500">Verified</div>
        </div>
      </div>
    </section>
  )
}
