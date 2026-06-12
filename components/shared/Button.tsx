'use client'

import React from 'react'
import { motion } from 'framer-motion'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#C8A96B]/[0.20] disabled:cursor-not-allowed disabled:opacity-60'
  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-r from-[#0B1F3A] to-[#1F3A2D] text-white shadow-lg shadow-slate-950/[0.15] hover:-translate-y-0.5',
    secondary: 'border border-[#C8A96B]/[0.35] bg-white text-[#0B1F3A] shadow-sm hover:bg-[#C8A96B]/[0.12]',
    ghost: 'bg-transparent text-[#232323]/[0.72] hover:bg-[#0B1F3A]/[0.06]'
  }

  return (
    <motion.button whileTap={{ scale: 0.98 }} className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </motion.button>
  )
}
