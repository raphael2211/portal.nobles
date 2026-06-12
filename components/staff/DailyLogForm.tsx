'use client'

import React, { useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import type { ActivityEvidence } from '../../types/portal'
import Button from '../shared/Button'
import UploadField from '../shared/UploadField'

export default function DailyLogForm() {
  const { addActivity } = useAuth()
  const [summary, setSummary] = useState('')
  const [tomorrowTodo, setTomorrowTodo] = useState('')
  const [evidence, setEvidence] = useState<ActivityEvidence[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setLoading(true)
    const result = await addActivity({ summary, tomorrowTodo, evidence })
    setLoading(false)
    if (!result.ok) {
      setMessage(result.message || 'Could not submit activity')
      return
    }
    setSummary('')
    setTomorrowTodo('')
    setEvidence([])
    setMessage('Submitted for admin verification. KPI can only be awarded after review.')
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="section-kicker">Daily activity</div>
          <h3 className="section-title mt-1">Submit work for verification</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Describe completed work, attach evidence, and set the next operating priority.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-[#F8F5EF] px-3 py-2 text-xs font-semibold text-[#7A6A42]">
          <Sparkles className="h-4 w-4" />
          Evidence required
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Activity completed today</span>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Summarize measurable work, decisions, outcomes, blockers, and handoffs."
            className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-white/[0.90] p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Tomorrow todo</span>
          <input
            value={tomorrowTodo}
            onChange={(event) => setTomorrowTodo(event.target.value)}
            placeholder="Set tomorrow's priority so role-cover handoff stays clean."
            className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white/[0.90] px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
          />
        </label>

        <div>
          <span className="text-sm font-medium text-slate-700">Evidence</span>
          <div className="mt-2">
            <UploadField value={evidence} onChange={setEvidence} />
          </div>
        </div>
      </div>

      {message && (
        <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${message.startsWith('Submitted') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
          {message}
        </div>
      )}

      <div className="mt-5 flex justify-end">
        <Button type="submit" disabled={loading}>
          <Send className="h-4 w-4" />
          {loading ? 'Submitting...' : 'Submit for review'}
        </Button>
      </div>
    </motion.form>
  )
}
