'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BadgeCheck, LockKeyhole, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [id, setId] = useState('UCHE0001')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState<string | null>(null)
  const [resetNotice, setResetNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handle = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setResetNotice(null)
    setLoading(true)
    const result = await login(id.trim().toUpperCase(), password)
    setLoading(false)
    if (!result.ok || !result.user) {
      setError(result.message || 'Invalid credentials')
      return
    }

    router.push(result.user.role === 'superuser' ? '/admin/dashboard' : '/staff/dashboard')
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#F8F5EF] px-4 py-8">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl premium-gradient p-6 text-white shadow-[0_30px_100px_rgba(11,31,58,0.24)] sm:p-8"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-white/[0.30]" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#C8A96B]/[0.35] bg-white/[0.10] text-[#C8A96B]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="text-2xl font-semibold">Nobles Performance OS</div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C8A96B]/[0.80]">Staff only</div>
              </div>
            </div>
            <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/[0.14] bg-white/[0.10] px-3 text-sm font-semibold text-white/[0.82] transition hover:border-[#C8A96B]/[0.60] hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </div>

          <div className="mt-16 max-w-xl">
            <div className="inline-flex items-center rounded-2xl border border-[#C8A96B]/[0.28] bg-[#C8A96B]/[0.10] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#E6D2A1]">
              Executive command access
            </div>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
              Performance accountability for a disciplined cooperative team.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/[0.74]">
              Sign in to manage daily logs, verified KPI awards, supervisor reviews, attendance exceptions, and portfolio performance.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {['Verified KPI flow', 'Role-aware access', 'Audit-ready reviews'].map((item) => (
              <div key={item} className="rounded-2xl border border-white/[0.14] bg-white/[0.10] p-4">
                <BadgeCheck className="h-5 w-5 text-[#C8A96B]" />
                <div className="mt-3 text-sm font-semibold">{item}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.form
          onSubmit={handle}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass flex min-h-[560px] flex-col justify-center rounded-2xl p-6 sm:p-8"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0B1F3A] text-[#C8A96B]">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-normal text-[#0B1F3A]">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-[#232323]/[0.60]">Use your Nobles Staff ID. Inactive users are blocked automatically.</p>

          <label className="mt-8 block">
            <span className="text-sm font-medium text-[#232323]/[0.72]">Staff ID</span>
            <input
              value={id}
              onChange={(event) => setId(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-[#0B1F3A]/[0.12] bg-white/[0.90] px-4 text-sm font-semibold uppercase outline-none transition focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
              placeholder="Enter Your Staff ID"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-[#232323]/[0.72]">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-[#0B1F3A]/[0.12] bg-white/[0.90] px-4 text-sm outline-none transition focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
              placeholder="Enter password"
            />
          </label>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setError(null)
                setResetNotice('Password reset requests are routed through your supervisor or Super User for identity verification.')
              }}
              className="text-sm font-semibold text-[#0B1F3A] underline decoration-[#C8A96B]/[0.60] underline-offset-4"
            >
              Forgot password?
            </button>
          </div>

          {error && <div className="mt-4 rounded-2xl border border-[#7A1F2B]/[0.15] bg-[#7A1F2B]/[0.08] px-4 py-3 text-sm font-medium text-[#7A1F2B]">{error}</div>}
          {resetNotice && <div className="mt-4 rounded-2xl border border-[#C8A96B]/[0.30] bg-[#C8A96B]/[0.12] px-4 py-3 text-sm font-medium text-[#0B1F3A]">{resetNotice}</div>}

          <button
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0B1F3A] px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/[0.15] transition hover:-translate-y-0.5 hover:bg-[#1F3A2D] disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Enter portal'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.form>
      </div>
    </main>
  )
}
