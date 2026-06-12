'use client'

import React from 'react'
import { Award, Banknote, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency, kpiRewardValue, progressPercent } from '../../lib/kpi'

export default function KPIProgressCard({ kpi }: { kpi: number }) {
  const progress = progressPercent(kpi)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="section-kicker">Monthly KPI</div>
          <h3 className="mt-1 text-3xl font-semibold tracking-normal text-[#0B1F3A]">{kpi} pts</h3>
          <p className="mt-2 text-sm text-[#232323]/[0.58]">Reward equivalent: {formatCurrency(kpiRewardValue(kpi))}</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0B1F3A] text-[#C8A96B]">
          <Award className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-[#232323]/[0.50]">
          <span>Progress</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[#0B1F3A]/[0.08]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[#0B1F3A] via-[#1F3A2D] to-[#C8A96B]"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#0B1F3A]/[0.07] p-3 text-sm">
          <Target className="mb-2 h-4 w-4 text-[#0B1F3A]" />
          <div className="font-semibold text-[#0B1F3A]">100 monthly target</div>
          <div className="text-xs text-[#232323]/[0.55]">30 day cycle</div>
        </div>
        <div className="rounded-2xl bg-[#C8A96B]/[0.14] p-3 text-sm">
          <Banknote className="mb-2 h-4 w-4 text-[#7A6A42]" />
          <div className="font-semibold text-[#0B1F3A]">NGN 500 per KPI</div>
          <div className="text-xs text-[#232323]/[0.55]">Verified work only</div>
        </div>
      </div>
    </motion.div>
  )
}
