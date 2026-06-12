'use client'

import React, { useState } from 'react'
import { KeyRound, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../notifications/NotificationProvider'
import Button from '../shared/Button'
import StatusBadge from '../shared/StatusBadge'
import type { Role, StaffStatus } from '../../types/portal'
import { STAFF_ASSIGNABLE_ROLES, STAFF_STATUS_OPTIONS, isStaffPortalRole, roleLabel, statusLabel } from '../../lib/rbac'

export default function StaffManagementTable() {
  const { users, deleteStaff, updateStaff } = useAuth()
  const { addNotification } = useNotifications()
  const [passwords, setPasswords] = useState<Record<number, string>>({})

  const staff = users.filter((user) => isStaffPortalRole(user.role))

  const resetPassword = async (id: number) => {
    const password = passwords[id]
    if (!password) return addNotification({ title: 'Password required', message: 'Enter a new password first', type: 'warning' })
    const result = await updateStaff(id, { password })
    if (!result.ok) return addNotification({ title: 'Error', message: result.message || 'Could not reset password', type: 'error' })
    setPasswords((prev) => ({ ...prev, [id]: '' }))
    addNotification({ title: 'Password updated', message: 'Staff can now use the assigned password', type: 'success' })
  }

  if (staff.length === 0) return <div className="panel text-sm text-slate-500">No staff registered yet.</div>

  return (
    <section className="panel">
      <div className="section-kicker">Directory</div>
      <h3 className="section-title mt-1">Staff access management</h3>

      <div className="mt-5 space-y-3">
        {staff.map((user) => (
          <div key={user.id} className="rounded-2xl border border-slate-100 bg-white/[0.78] p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-semibold text-[#0B1F3A]">{user.fullName}</div>
                  <StatusBadge value={(user.status || (user.active ? 'ACTIVE' : 'INACTIVE')).toLowerCase()} />
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {user.staffId} / {roleLabel(user.role)} / {user.department || 'Operations'} / KPI {user.kpi}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={user.role}
                  onChange={async (event) => {
                    const role = event.target.value as Role
                    const result = await updateStaff(user.id, { role })
                    addNotification({
                      title: result.ok ? 'Role updated' : 'Error',
                      message: result.ok ? `${user.fullName} is now ${roleLabel(role)}` : result.message,
                      type: result.ok ? 'success' : 'error',
                    })
                  }}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
                >
                  {STAFF_ASSIGNABLE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {roleLabel(role)}
                    </option>
                  ))}
                </select>
                <select
                  value={user.status || (user.active ? 'ACTIVE' : 'INACTIVE')}
                  onChange={async (event) => {
                    const status = event.target.value as StaffStatus
                    const result = await updateStaff(user.id, { status })
                    addNotification({
                      title: result.ok ? 'Status updated' : 'Error',
                      message: result.ok ? `${user.fullName} is ${statusLabel(status)}` : result.message,
                      type: result.ok ? 'info' : 'error',
                    })
                  }}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
                >
                  {STAFF_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
                <input
                  value={passwords[user.id] || ''}
                  onChange={(event) => setPasswords((prev) => ({ ...prev, [user.id]: event.target.value }))}
                  placeholder="New password"
                  type="password"
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
                />
                <Button type="button" variant="secondary" onClick={() => resetPassword(user.id)}>
                  <KeyRound className="h-4 w-4" />
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={async () => {
                    const result = await deleteStaff(user.id)
                    addNotification({
                      title: result.ok ? 'Deleted' : 'Error',
                      message: result.ok ? `${user.fullName} removed` : result.message,
                      type: result.ok ? 'warning' : 'error',
                    })
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
