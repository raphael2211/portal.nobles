'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

function useCountUp(value: number, duration = 800) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    let frame = 0
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const elapsed = ts - start
      const progress = Math.min(elapsed / duration, 1)
      setCurrent(Math.round(progress * value))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return current
}

export default function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = 'navy',
}: {
  title: string
  value: string
  detail?: string
  icon?: LucideIcon
  tone?: 'navy' | 'gold' | 'slate' | 'forest'
}) {
  const matched = value.match(/-?\d+(?:\.\d+)?/)
  const numeric = matched ? Number(matched[0]) : 0
  const animated = useCountUp(Number.isFinite(numeric) ? Math.round(numeric) : 0)
  const displayValue = matched && !value.includes('$') ? value.replace(matched[0], String(animated)) : value

  const tones = {
    navy: 'from-[#0B1F3A] via-[#102B4D] to-[#1F3A2D] text-white',
    gold: 'from-[#0B1F3A] via-[#1F3A2D] to-[#C8A96B] text-white',
    slate: 'from-[#232323] via-[#0B1F3A] to-[#1F3A2D] text-white',
    forest: 'from-[#12352f] via-[#1F3A2D] to-[#C8A96B] text-white',
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tones[tone]} p-5 shadow-[0_24px_70px_rgba(11,31,58,0.18)]`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.35]" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.70]">{title}</div>
          <div className="mt-3 text-3xl font-semibold tracking-normal">{displayValue}</div>
          {detail && <div className="mt-2 text-sm text-white/[0.72]">{detail}</div>}
        </div>
        {Icon && (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/[0.15] bg-white/[0.12]">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
