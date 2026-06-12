'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Briefcase,
  ClipboardCheck,
  Clock3,
  LineChart,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react'

const features = [
  { title: 'Attendance Tracking', icon: Clock3 },
  { title: 'KPI Monitoring', icon: Target },
  { title: 'Daily Logs', icon: ClipboardCheck },
  { title: 'Team Performance', icon: Users },
  { title: 'Loan Performance', icon: BarChart3 },
  { title: 'Portfolio Management', icon: Briefcase },
  { title: 'Supervisor Reviews', icon: ShieldCheck },
]

const executiveMetrics = [
  { label: 'Organization KPI', value: '87%' },
  { label: 'Attendance', value: '94%' },
  { label: 'Portfolio Health', value: '72%' },
]

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F8F5EF] text-[#232323]">
      <section className="relative min-h-[84svh] overflow-hidden bg-[#07172A] px-4 pb-12 pt-5 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(200,169,107,0.18),transparent_28%),linear-gradient(135deg,rgba(11,31,58,0.98),rgba(31,58,45,0.9)_56%,rgba(8,18,32,0.98))]" />
        <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(248,245,239,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(248,245,239,0.14)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 28, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute left-[42%] top-24 hidden w-[760px] rounded-2xl border border-white/[0.12] bg-[#F8F5EF]/[0.08] p-4 shadow-[0_40px_120px_rgba(0,0,0,0.34)] backdrop-blur-xl lg:block"
          >
            <div className="grid gap-3">
              <div className="flex items-center justify-between border-b border-white/[0.10] pb-3">
                <div>
                  <div className="h-2 w-36 rounded-full bg-[#C8A96B]" />
                  <div className="mt-2 h-2 w-52 rounded-full bg-white/[0.18]" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {executiveMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-white/[0.10] bg-white/[0.10] px-3 py-2">
                      <div className="text-lg font-semibold text-[#F8F5EF]">{metric.value}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/[0.45]">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[1.1fr_0.9fr] gap-3">
                <div className="rounded-2xl border border-white/[0.10] bg-[#07172A]/[0.42] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#C8A96B]">Performance Trend</div>
                    <LineChart className="h-4 w-4 text-[#C8A96B]" />
                  </div>
                  <div className="mt-8 flex h-32 items-end gap-2">
                    {[42, 56, 48, 70, 61, 82, 76, 91].map((height, index) => (
                      <motion.div
                        key={height + index}
                        initial={{ height: 12 }}
                        animate={{ height }}
                        transition={{ delay: 0.15 + index * 0.04, duration: 0.55 }}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-[#1F3A2D] to-[#C8A96B]"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {['Supervisor review queue', 'Attendance exception log', 'Reward approval ledger'].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + index * 0.08 }}
                      className="rounded-2xl border border-white/[0.10] bg-white/[0.10] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <BadgeCheck className="h-5 w-5 text-[#C8A96B]" />
                        <div>
                          <div className="text-sm font-semibold text-[#F8F5EF]">{item}</div>
                          <div className="mt-1 h-1.5 w-40 rounded-full bg-white/[0.14]">
                            <div className="h-full rounded-full bg-[#C8A96B]" style={{ width: `${62 + index * 12}%` }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative mx-auto flex min-h-[calc(84svh-2.5rem)] w-full max-w-7xl flex-col">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#C8A96B]/[0.35] bg-white/[0.08] text-[#C8A96B]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-base font-semibold tracking-normal text-[#F8F5EF]">Nobles Cooperative Limited</div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C8A96B]/[0.80]">Executive Performance</div>
              </div>
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/[0.14] bg-white/[0.10] px-4 text-sm font-semibold text-white transition hover:border-[#C8A96B]/[0.70] hover:bg-[#C8A96B] hover:text-[#0B1F3A]"
            >
              Staff Login
            </Link>
          </header>

          <div className="grid flex-1 items-center py-16">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-[#C8A96B]/[0.28] bg-[#C8A96B]/[0.10] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E6D2A1]">
                Private operating system
              </div>
              <h1 className="mt-7 text-5xl font-semibold leading-[0.98] tracking-normal text-[#F8F5EF] sm:text-6xl lg:text-7xl">
                Performance. Accountability. Growth.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/[0.74] sm:text-xl">
                The Nobles Staff Performance Operating System
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#C8A96B] px-5 text-sm font-semibold text-[#0B1F3A] shadow-[0_18px_50px_rgba(200,169,107,0.24)] transition hover:-translate-y-0.5"
                >
                  Staff Login
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/[0.16] bg-white/[0.08] px-5 text-sm font-semibold text-white transition hover:border-[#C8A96B]/[0.70] hover:bg-white/[0.12]"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="features" className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
        <div>
          <div className="section-kicker">Capability suite</div>
          <h2 className="mt-3 max-w-sm text-3xl font-semibold leading-tight tracking-normal text-[#0B1F3A]">
            Executive clarity for every staff performance decision.
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {features.map(({ title, icon: Icon }) => (
            <motion.div
              key={title}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-[#0B1F3A]/[0.10] bg-white/[0.70] p-4 shadow-[0_18px_50px_rgba(11,31,58,0.07)]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1F3A2D] text-[#C8A96B]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold text-[#0B1F3A]">{title}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#0B1F3A]/[0.10] px-4 py-8 text-sm text-[#232323]/[0.62] sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-semibold text-[#0B1F3A]">Nobles Cooperative Limited</div>
          <div>Premium staff performance management for disciplined growth.</div>
        </div>
      </footer>
    </main>
  )
}
