'use client'

import React from 'react'
import RoleCoverMatrix from '../../../components/admin/RoleCoverMatrix'

export default function RoleCoverPage() {
  return (
    <div className="space-y-6">
      <section>
        <div className="section-kicker">Operational resilience</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#0B1F3A]">Role-cover matrix</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Define primary role holders, backups, readiness levels, and temporary permissions for continuity.</p>
      </section>
      <RoleCoverMatrix />
    </div>
  )
}
