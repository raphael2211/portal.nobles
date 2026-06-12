'use client'

import React, { useState } from 'react'
import { BookOpen, Send } from 'lucide-react'
import LMSUploadForm from '../../../components/lms/LMSUploadForm'
import { useAuth } from '../../../context/AuthContext'
import Button from '../../../components/shared/Button'
import StatusBadge from '../../../components/shared/StatusBadge'
import { useNotifications } from '../../../components/notifications/NotificationProvider'
import { isActiveStatus, isStaffPortalRole } from '../../../lib/rbac'

export default function AdminLMS() {
  const { courses, users, assignCourse } = useAuth()
  const { addNotification } = useNotifications()
  const staff = users.filter((user) => isStaffPortalRole(user.role) && isActiveStatus(user.status, user.active))
  const [selectedStaff, setSelectedStaff] = useState<Record<number, number>>({})

  return (
    <div className="space-y-6">
      <section>
        <div className="section-kicker">LMS command</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#0B1F3A]">Learning management</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Upload courses, assign staff, and track training coverage from one place.</p>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <LMSUploadForm />

        <section className="panel">
          <div className="flex items-center justify-between">
            <div>
              <div className="section-kicker">Course library</div>
              <h3 className="section-title mt-1">Assignable courses</h3>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C8A96B]/[0.12] text-[#0B1F3A]">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {courses.length === 0 && <p className="text-sm text-slate-500">No courses yet.</p>}
            {courses.map((course) => (
              <article key={course.id} className="rounded-2xl border border-slate-100 bg-white/[0.78] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-[#0B1F3A]">{course.title}</h4>
                      <StatusBadge value={course.type} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{course.description}</p>
                    <p className="mt-2 text-xs font-medium text-slate-400">{course.durationMinutes} minutes</p>
                  </div>
                  <div className="flex min-w-64 flex-col gap-2 sm:flex-row lg:flex-col">
                    <select
                      value={selectedStaff[course.id] || ''}
                      onChange={(event) => setSelectedStaff((prev) => ({ ...prev, [course.id]: Number(event.target.value) }))}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
                    >
                      <option value="">Assign staff</option>
                      {staff.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      onClick={async () => {
                        const userId = selectedStaff[course.id]
                        if (!userId) return addNotification({ title: 'Select staff', message: 'Choose a staff member first', type: 'warning' })
                        const result = await assignCourse(course.id, userId)
                        addNotification({
                          title: result.ok ? 'Course assigned' : 'Assignment failed',
                          message: result.ok ? `${course.title} assigned` : result.message,
                          type: result.ok ? 'success' : 'error',
                        })
                      }}
                    >
                      <Send className="h-4 w-4" />
                      Assign
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
