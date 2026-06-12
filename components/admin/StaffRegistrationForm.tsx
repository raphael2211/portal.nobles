'use client'

import React, { useState } from 'react'
import { UserPlus } from 'lucide-react'
import Input from '../shared/Input'
import Button from '../shared/Button'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../notifications/NotificationProvider'
import type { Role } from '../../types/portal'
import { STAFF_ASSIGNABLE_ROLES, roleLabel } from '../../lib/rbac'

export default function StaffRegistrationForm() {
  const { registerStaff } = useAuth()
  const { addNotification } = useNotifications()
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [title, setTitle] = useState('')
  const [role, setRole] = useState<Role>('operations_officer')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id || !name || !password) return addNotification({ title: 'Missing fields', message: 'Please fill staff ID, name, and password', type: 'warning' })
    if (password !== confirm) return addNotification({ title: 'Password mismatch', message: 'Passwords must match', type: 'warning' })
    setLoading(true)
    const result = await registerStaff({ staffId: id.trim().toUpperCase(), fullName: name, password, department, title, role })
    setLoading(false)
    if (!result.ok) return addNotification({ title: 'Error', message: result.message || 'Could not register', type: 'error' })
    addNotification({ title: 'Staff registered', message: `${name} now has portal access`, type: 'success' })
    setId('')
    setName('')
    setDepartment('')
    setTitle('')
    setRole('operations_officer')
    setPassword('')
    setConfirm('')
  }

  return (
    <form onSubmit={submit} className="panel">
      <div className="flex items-center justify-between">
        <div>
          <div className="section-kicker">Access</div>
          <h3 className="section-title mt-1">Register staff</h3>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C8A96B]/[0.12] text-[#0B1F3A]">
          <UserPlus className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Input label="Staff ID" value={id} onChange={(event) => setId(event.target.value)} placeholder="NBL0005" />
        <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full Name" />
        <Input label="Department" value={department} onChange={(event) => setDepartment(event.target.value)} placeholder="Operations" />
        <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Staff Member" />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
          >
            {STAFF_ASSIGNABLE_ROLES.map((item) => (
              <option key={item} value={item}>
                {roleLabel(item)}
              </option>
            ))}
          </select>
        </label>
        <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Assign a password" />
        <Input label="Confirm password" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Confirm password" />
      </div>

      <div className="mt-5">
        <Button type="submit" disabled={loading} className="w-full">
          <UserPlus className="h-4 w-4" />
          {loading ? 'Creating...' : 'Create staff account'}
        </Button>
      </div>
    </form>
  )
}
