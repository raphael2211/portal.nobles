'use client'

import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
}

export default function Input({ label, className = '', ...rest }: InputProps) {
  return (
    <label className="block">
      {label && <div className="mb-1.5 text-sm font-medium text-[#232323]/[0.72]">{label}</div>}
      <input
        className={`h-11 w-full rounded-xl border border-[#0B1F3A]/[0.12] bg-white/[0.90] px-3 text-sm outline-none transition placeholder:text-[#232323]/[0.36] focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20] ${className}`}
        {...rest}
      />
    </label>
  )
}
