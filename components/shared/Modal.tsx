'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-[#0B1F3A]/[0.48] backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl border border-white/[0.70] bg-white/[0.90] p-6 shadow-[0_30px_90px_rgba(26,13,36,0.28)]">
        {title && <h3 className="text-lg font-semibold text-noblePurple">{title}</h3>}
        <div className="mt-4">{children}</div>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">Close</button>
        </div>
      </motion.div>
    </div>
  )
}
