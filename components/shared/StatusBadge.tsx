'use client'

import React from 'react'

const styles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 ring-slate-200',
  submitted: 'bg-blue-50 text-blue-700 ring-blue-100',
  under_review: 'bg-amber-50 text-amber-800 ring-amber-100',
  verified: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  rewarded: 'bg-[#C8A96B]/[0.16] text-[#5F4A25] ring-[#C8A96B]/[0.30]',
  penalized: 'bg-rose-50 text-rose-700 ring-rose-100',
  rejected: 'bg-red-50 text-red-700 ring-red-100',
  pending: 'bg-slate-100 text-slate-700 ring-slate-200',
  'in-progress': 'bg-amber-50 text-amber-800 ring-amber-100',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  manual: 'bg-[#0B1F3A]/[0.08] text-[#0B1F3A] ring-[#0B1F3A]/[0.12]',
  video: 'bg-blue-50 text-blue-700 ring-blue-100',
  pdf: 'bg-rose-50 text-rose-700 ring-rose-100',
  mixed: 'bg-[#C8A96B]/[0.14] text-[#5F4A25] ring-[#C8A96B]/[0.40]',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  inactive: 'bg-rose-50 text-rose-700 ring-rose-100',
  suspended: 'bg-amber-50 text-amber-800 ring-amber-100',
  terminated: 'bg-slate-200 text-slate-700 ring-slate-300',
  present: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  late: 'bg-amber-50 text-amber-800 ring-amber-100',
  absent: 'bg-rose-50 text-rose-700 ring-rose-100',
  field_work: 'bg-blue-50 text-blue-700 ring-blue-100',
  approved_leave: 'bg-[#C8A96B]/[0.14] text-[#5F4A25] ring-[#C8A96B]/[0.40]',
  not_checked_in: 'bg-slate-100 text-slate-700 ring-slate-200',
}

function labelFor(value: string) {
  return value
    .replace(/_/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[value] || styles.pending}`}>
      {labelFor(value)}
    </span>
  )
}
