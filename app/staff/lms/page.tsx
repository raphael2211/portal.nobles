'use client'

import React from 'react'
import { BookOpen } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import LMSCourseCard from '../../../components/staff/LMSCourseCard'
import StatCard from '../../../components/shared/StatCard'

export default function StaffLMS() {
  const { assignedCourses, updateCourseProgress } = useAuth()
  const completed = assignedCourses.filter((course) => course.status === 'completed').length
  const average = assignedCourses.length ? Math.round(assignedCourses.reduce((sum, course) => sum + course.progress, 0) / assignedCourses.length) : 0

  return (
    <div className="space-y-6">
      <section>
        <div className="section-kicker">Learning</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#0B1F3A]">My LMS</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Open assigned courses, track progress, and complete role-readiness training.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Assigned" value={String(assignedCourses.length)} detail="Courses" icon={BookOpen} />
        <StatCard title="Completed" value={String(completed)} detail="Finished courses" icon={BookOpen} tone="forest" />
        <StatCard title="Average" value={`${average}%`} detail="Progress" icon={BookOpen} tone="gold" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {assignedCourses.length === 0 && <div className="panel text-sm text-slate-500">No courses have been assigned yet.</div>}
        {assignedCourses.map((assignment) => (
          <LMSCourseCard key={assignment.id} assignment={assignment} onProgress={(progress) => updateCourseProgress(assignment.id, progress)} />
        ))}
      </section>
    </div>
  )
}
