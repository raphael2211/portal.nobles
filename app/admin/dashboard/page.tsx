'use client'

import React from 'react'
import { Activity, Banknote, ClipboardCheck, Users } from 'lucide-react'
import StatCard from '../../../components/shared/StatCard'
import StaffReviewTable from '../../../components/admin/StaffReviewTable'
import AdminKPICharts from '../../../components/shared/charts/AdminKPICharts'
import { useAuth } from '../../../context/AuthContext'
import DailySummaryCard from '../../../components/admin/DailySummaryCard'
import WeeklySummaryCard from '../../../components/admin/WeeklySummaryCard'
import MonthlySummaryCard from '../../../components/admin/MonthlySummaryCard'
import StaffAnalyticsTable from '../../../components/admin/StaffAnalyticsTable'
import { formatCurrency, kpiRewardValue } from '../../../lib/kpi'
import { isStaffPortalRole } from '../../../lib/rbac'

export default function AdminDashboard() {
  const { analytics, users, activityLogs } = useAuth()
  const staff = users.filter((user) => isStaffPortalRole(user.role))
  const pending = analytics?.pendingReviews ?? activityLogs.filter((log) => log.status === 'submitted' || log.status === 'under_review').length
  const payout = analytics?.payout ?? kpiRewardValue(staff.reduce((sum, user) => sum + user.kpi, 0))

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl premium-gradient p-6 text-white shadow-[0_28px_90px_rgba(11,31,58,0.22)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/[0.60]">Central operation command center</div>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-normal sm:text-5xl">
              Verify work, protect standards, and keep the team moving.
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <div className="rounded-2xl border border-white/[0.15] bg-white/[0.10] p-4">
              <div className="text-2xl font-semibold">{analytics?.verificationRate ?? 0}%</div>
              <div className="text-sm text-white/[0.65]">Verification rate</div>
            </div>
            <div className="rounded-2xl border border-white/[0.15] bg-white/[0.10] p-4">
              <div className="text-2xl font-semibold">{analytics?.lmsCompletion ?? 0}%</div>
              <div className="text-sm text-white/[0.65]">LMS complete</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Staff" value={String(analytics?.totalStaff ?? staff.length)} detail="Active staff accounts" icon={Users} />
        <StatCard title="KPI Payouts" value={formatCurrency(payout)} detail="Current cycle liability" icon={Banknote} tone="gold" />
        <StatCard title="Pending Reviews" value={String(pending)} detail="Needs verification" icon={ClipboardCheck} tone="slate" />
        <StatCard title="Monthly Rewards" value={String(analytics?.rewards ?? 0)} detail="KPI awarded this cycle" icon={Activity} tone="forest" />
      </section>

      {analytics && (
        <section className="grid gap-4 lg:grid-cols-3">
          <DailySummaryCard summary={analytics.daily} />
          <WeeklySummaryCard summary={analytics.weekly} />
          <MonthlySummaryCard summary={analytics.monthly} />
        </section>
      )}

      <StaffReviewTable />
      <AdminKPICharts />
      <StaffAnalyticsTable staff={analytics?.rankings || staff} />
    </div>
  )
}
