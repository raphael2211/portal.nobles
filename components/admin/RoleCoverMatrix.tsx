'use client'

import React, { useState } from 'react'
import { Repeat2, Save } from 'lucide-react'
import type { ReadinessLevel } from '../../types/portal'
import { useAuth } from '../../context/AuthContext'
import Button from '../shared/Button'
import { isActiveStatus, isStaffPortalRole } from '../../lib/rbac'

const readinessOptions: ReadinessLevel[] = ['Ready now', 'Needs briefing', 'Training', 'Unavailable']

export default function RoleCoverMatrix() {
  const { users, roleCover, upsertRoleCover } = useAuth()
  const staff = users.filter((user) => isStaffPortalRole(user.role) && isActiveStatus(user.status, user.active))
  const [form, setForm] = useState({
    functionName: '',
    primaryUserId: 0,
    backupUserId: 0,
    readiness: 'Training' as ReadinessLevel,
    temporaryPermissions: '',
  })

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    await upsertRoleCover(form)
    setForm({ functionName: '', primaryUserId: 0, backupUserId: 0, readiness: 'Training', temporaryPermissions: '' })
  }

  const nameFor = (id: number) => users.find((user) => user.id === id)?.fullName || 'Unassigned'

  return (
    <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
      <form onSubmit={save} className="panel">
        <div className="flex items-center justify-between">
          <div>
            <div className="section-kicker">Continuity</div>
            <h3 className="section-title mt-1">Configure cover</h3>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C8A96B]/[0.12] text-[#0B1F3A]">
            <Repeat2 className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <input
            value={form.functionName}
            onChange={(event) => setForm((prev) => ({ ...prev, functionName: event.target.value }))}
            placeholder="Critical function"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
          />
          <select
            value={form.primaryUserId || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, primaryUserId: Number(event.target.value) }))}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
          >
            <option value="">Primary role holder</option>
            {staff.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
          </select>
          <select
            value={form.backupUserId || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, backupUserId: Number(event.target.value) }))}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
          >
            <option value="">Backup role holder</option>
            {staff.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
          </select>
          <select
            value={form.readiness}
            onChange={(event) => setForm((prev) => ({ ...prev, readiness: event.target.value as ReadinessLevel }))}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
          >
            {readinessOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <textarea
            value={form.temporaryPermissions}
            onChange={(event) => setForm((prev) => ({ ...prev, temporaryPermissions: event.target.value }))}
            placeholder="Temporary permissions"
            className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
          />
        </div>

        <Button type="submit" className="mt-5 w-full">
          <Save className="h-4 w-4" />
          Save cover rule
        </Button>
      </form>

      <section className="panel">
        <div className="section-kicker">Matrix</div>
        <h3 className="section-title mt-1">Role-cover readiness</h3>

        <div className="mt-5 space-y-3">
          {roleCover.length === 0 && <p className="text-sm text-slate-500">No cover rules configured yet.</p>}
          {roleCover.map((entry) => (
            <article key={entry.id} className="rounded-2xl border border-slate-100 bg-white/[0.78] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h4 className="font-semibold text-[#0B1F3A]">{entry.functionName}</h4>
                  <p className="mt-1 text-sm text-slate-500">Primary: {nameFor(entry.primaryUserId)} / Backup: {nameFor(entry.backupUserId)}</p>
                </div>
                <div className="rounded-full bg-[#F8F5EF] px-3 py-1 text-xs font-semibold text-[#5F4A25]">{entry.readiness}</div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">{entry.temporaryPermissions}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
