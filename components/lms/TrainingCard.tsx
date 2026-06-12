'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function TrainingCard({ title, desc, status }: { title: string; desc: string; status: 'pending'|'in-progress'|'completed' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(91,44,111,0.12), rgba(219,153,228,0.06))' }}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-noblePurple">{title}</h4>
          <p className="text-sm text-slate-600">{desc}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs ${status === 'completed' ? 'bg-emerald-100 text-emerald-800' : status === 'in-progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>{status}</div>
      </div>
    </motion.div>
  )
}
