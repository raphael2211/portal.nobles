'use client'

import React from 'react'
import { Clock, ShieldCheck } from 'lucide-react'
import type { ActivityLog, AssignedCourse } from '../../types/portal'

export default function PersonalSummary({ logs, courses }: { logs: ActivityLog[]; courses: AssignedCourse[] }) {
  const pending = logs.filter((log) => log.status === 'submitted' || log.status === 'under_review').length
  const verified = logs.filter((log) => ['verified', 'rewarded', 'penalized'].includes(log.status)).length
  const completion = courses.length ? Math.round((courses.filter((course) => course.status === 'completed').length / courses.length) * 100) : 0

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      <div className="panel">
        <Clock className="h-5 w-5 text-amber-600" />
        <div className="mt-3 text-2xl font-semibold text-[#0B1F3A]">{pending}</div>
        <div className="text-sm text-slate-500">Pending reviews</div>
      </div>
      <div className="panel">
        <ShieldCheck className="h-5 w-5 text-emerald-600" />
        <div className="mt-3 text-2xl font-semibold text-[#0B1F3A]">{verified}</div>
        <div className="text-sm text-slate-500">Verified logs</div>
      </div>
      <div className="panel">
        <ShieldCheck className="h-5 w-5 text-[#0B1F3A]" />
        <div className="mt-3 text-2xl font-semibold text-[#0B1F3A]">{completion}%</div>
        <div className="text-sm text-slate-500">LMS completion</div>
      </div>
    </section>
  )
}
