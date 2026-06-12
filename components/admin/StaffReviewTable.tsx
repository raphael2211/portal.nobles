'use client'

import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import KPIApprovalCard from './KPIApprovalCard'

export default function StaffReviewTable() {
  const { activityLogs, reviewActivity, users } = useAuth()
  const pending = activityLogs.filter((log) => log.status === 'submitted' || log.status === 'under_review')

  return (
    <section className="panel">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="section-kicker">Verification queue</div>
          <h3 className="section-title mt-1">Evidence review and KPI control</h3>
        </div>
        <div className="rounded-full bg-[#C8A96B]/[0.12] px-3 py-1 text-sm font-semibold text-[#0B1F3A]">{pending.length} pending</div>
      </div>

      <div className="mt-5 space-y-4">
        {pending.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/[0.70] p-6 text-sm text-slate-500">
            No pending reviews. The queue is clear.
          </div>
        )}
        <AnimatePresence>
          {pending.map((log) => (
            <motion.div key={log.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
              <KPIApprovalCard log={log} staff={users.find((user) => user.id === log.userId)} onReview={reviewActivity} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
