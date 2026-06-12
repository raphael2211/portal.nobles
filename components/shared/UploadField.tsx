'use client'

import React, { useState } from 'react'
import { Link2, Plus, Trash2 } from 'lucide-react'
import type { ActivityEvidence, EvidenceType } from '../../types/portal'

const evidenceTypes: EvidenceType[] = ['link', 'text', 'image', 'video']

export default function UploadField({
  value,
  onChange,
}: {
  value: ActivityEvidence[]
  onChange: (items: ActivityEvidence[]) => void
}) {
  const [type, setType] = useState<EvidenceType>('link')
  const [input, setInput] = useState('')

  const addEvidence = () => {
    if (!input.trim()) return
    onChange([
      ...value,
      {
        id: `ev_${Date.now()}`,
        type,
        value: input.trim(),
      },
    ])
    setInput('')
  }

  return (
    <div className="rounded-2xl border border-white/[0.70] bg-white/[0.70] p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={type}
          onChange={(event) => setType(event.target.value as EvidenceType)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
        >
          {evidenceTypes.map((item) => (
            <option key={item} value={item}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste evidence, note, image URL, video URL, or document link"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
          />
        </div>
        <button
          type="button"
          onClick={addEvidence}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/[0.10] transition hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {value.length === 0 && <p className="text-xs text-slate-500">Evidence is required before a log can be submitted.</p>}
        {value.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm">
            <div className="min-w-0">
              <span className="mr-2 rounded-full bg-[#C8A96B]/[0.12] px-2 py-0.5 text-[11px] font-semibold uppercase text-[#0B1F3A]">{item.type}</span>
              <span className="break-all text-slate-700">{item.value}</span>
            </div>
            <button
              type="button"
              onClick={() => onChange(value.filter((candidate) => candidate.id !== item.id))}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              aria-label="Remove evidence"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
