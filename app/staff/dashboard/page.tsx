'use client'

import React from 'react'
import { BookOpen, Clock3, Target } from 'lucide-react'
import StatCard from '../../../components/shared/StatCard'
import DailyLogForm from '../../../components/staff/DailyLogForm'
import { useAuth } from '../../../context/AuthContext'
import DoughnutChart from '../../../components/shared/charts/DoughnutChart'
import KPITrendChart from '../../../components/shared/charts/KPITrendChart'
import KPIProgressCard from '../../../components/staff/KPIProgressCard'
import TodoSection from '../../../components/staff/TodoSection'
import NotificationWidget from '../../../components/staff/NotificationWidget'
import PersonalSummary from '../../../components/staff/PersonalSummary'
import MonthlyTargetProgress from '../../../components/staff/MonthlyTargetProgress'
import GeoAttendanceCard from '../../../components/staff/GeoAttendanceCard'
import { formatCurrency, kpiRewardValue, progressPercent } from '../../../lib/kpi'

export default function StaffDashboard() {
  const { user, activityLogs, assignedCourses } = useAuth()
  if (!user) return <div className="p-6">Loading...</div>

  const doughData = [
    { name: 'Earned', value: user.kpi },
    { name: 'Remaining', value: Math.max(0, 100 - user.kpi) },
  ]

  const rewardedLogs = activityLogs
    .filter((log) => log.status === 'rewarded' || log.status === 'verified' || log.status === 'penalized')
    .slice()
    .reverse()

  const trend = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000)
    const cutoff = date.getTime()
    const kpi = rewardedLogs
      .filter((log) => new Date(log.reviewedAt || log.createdAt).getTime() <= cutoff)
      .reduce((sum, log) => sum + log.kpiAssigned - log.penaltyAssigned, Math.max(0, user.kpi - 20))
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      kpi: Math.max(0, Math.min(user.kpi, kpi)),
    }
  })

  const pending = activityLogs.filter((log) => log.status === 'submitted' || log.status === 'under_review').length
  const lmsProgress = assignedCourses.length ? Math.round(assignedCourses.reduce((sum, course) => sum + course.progress, 0) / assignedCourses.length) : 0

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl premium-gradient p-6 text-white shadow-[0_28px_90px_rgba(11,31,58,0.22)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/[0.60]">Personal dashboard</div>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-normal sm:text-5xl">
              Welcome, {user.fullName.split(' ')[0]}. Keep today precise.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/[0.70]">
              Submit evidence-rich work, monitor KPI reward value, and keep tomorrow's handoff visible.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.15] bg-white/[0.10] p-4">
            <div className="text-3xl font-semibold">{progressPercent(user.kpi).toFixed(0)}%</div>
            <div className="text-sm text-white/[0.66]">Monthly KPI target</div>
          </div>
        </div>
      </section>

      <GeoAttendanceCard />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="KPI Points" value={String(user.kpi)} detail="Current cycle" icon={Target} />
        <StatCard title="KPI Value" value={formatCurrency(kpiRewardValue(user.kpi))} detail="NGN 500 per point" icon={Target} tone="gold" />
        <StatCard title="Pending Reviews" value={String(pending)} detail="Awaiting verification" icon={Clock3} tone="slate" />
        <StatCard title="LMS Progress" value={`${lmsProgress}%`} detail="Assigned courses" icon={BookOpen} tone="forest" />
      </section>

      <PersonalSummary logs={activityLogs} courses={assignedCourses} />

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <KPIProgressCard kpi={user.kpi} />
        <div className="panel">
          <div className="section-kicker">KPI distribution</div>
          <h3 className="section-title mt-1">Earned vs remaining</h3>
          <DoughnutChart data={doughData} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel">
          <div className="section-kicker">Momentum</div>
          <h3 className="section-title mt-1">KPI trend</h3>
          <KPITrendChart data={trend} />
        </div>
        <MonthlyTargetProgress kpi={user.kpi} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <DailyLogForm />
        <div className="space-y-4">
          <TodoSection logs={activityLogs} />
          <NotificationWidget />
        </div>
      </section>
    </div>
  )
}
