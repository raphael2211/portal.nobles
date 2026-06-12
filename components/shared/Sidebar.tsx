'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, ClipboardCheck, LayoutDashboard, Repeat2, ShieldCheck, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const adminLinks = [
  { href: '/admin/dashboard', label: 'Command', icon: LayoutDashboard },
  { href: '/admin/staff', label: 'Staff', icon: Users },
  { href: '/admin/lms', label: 'LMS', icon: BookOpen },
  { href: '/admin/role-cover', label: 'Cover', icon: Repeat2 },
]

const staffLinks = [
  { href: '/staff/dashboard', label: 'Today', icon: LayoutDashboard },
  { href: '/staff/lms', label: 'LMS', icon: BookOpen },
]

export default function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const links = user?.role === 'superuser' ? adminLinks : staffLinks

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-[#0B1F3A]/[0.10] bg-[#F8F5EF]/[0.88] px-5 py-6 shadow-[18px_0_70px_rgba(11,31,58,0.08)] backdrop-blur-2xl lg:flex lg:flex-col">
        <Link href={user?.role === 'superuser' ? '/admin/dashboard' : '/staff/dashboard'} className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl premium-gradient text-[#C8A96B] shadow-lg shadow-slate-950/[0.20]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-normal text-[#0B1F3A]">Nobles Portal</div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#7A6A42]">Internal Ops</div>
          </div>
        </Link>

        <div className="mt-8 rounded-2xl border border-[#C8A96B]/[0.30] bg-white/[0.65] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7A6A42]">Signed in</div>
          <div className="mt-2 font-semibold text-[#0B1F3A]">{user?.fullName}</div>
          <div className="text-sm text-[#232323]/[0.58]">{user?.title || user?.department || 'Operations'}</div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                  active
                    ? 'bg-[#0B1F3A] text-white shadow-lg shadow-slate-950/[0.15]'
                    : 'text-[#232323]/[0.64] hover:bg-[#C8A96B]/[0.14] hover:text-[#0B1F3A]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="rounded-2xl border border-[#C8A96B]/[0.45] bg-[#C8A96B]/[0.12] p-4 text-sm text-[#5F4A25]">
          <div className="flex items-center gap-2 font-semibold">
            <ClipboardCheck className="h-4 w-4" />
            Evidence-first culture
          </div>
          <p className="mt-2 text-xs leading-5 text-[#6E5A34]">KPI rewards unlock only after a verified activity trail.</p>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-2 gap-2 rounded-2xl border border-[#0B1F3A]/[0.10] bg-[#F8F5EF]/[0.92] p-2 shadow-[0_18px_60px_rgba(11,31,58,0.18)] backdrop-blur-2xl lg:hidden" style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold transition ${
                active ? 'bg-[#0B1F3A] text-white' : 'text-[#232323]/[0.56] hover:bg-[#C8A96B]/[0.14] hover:text-[#0B1F3A]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
