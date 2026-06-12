'use client'

import React from 'react'
import { LogOut, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../notifications/NotificationBell'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const firstName = user?.fullName?.split(' ')[0] || 'there'

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#0B1F3A]/[0.10] bg-[#F8F5EF]/[0.78] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-[#232323]/[0.55]">Welcome back, {firstName}</div>
          <div className="truncate text-base font-semibold text-[#0B1F3A]">{user?.role === 'superuser' ? 'Operations command center' : 'Personal performance workspace'}</div>
        </div>

        <div className="hidden min-w-0 max-w-md flex-1 items-center rounded-2xl border border-[#0B1F3A]/[0.10] bg-white/[0.70] px-3 py-2 text-sm text-[#232323]/[0.42] shadow-sm md:flex">
          <Search className="mr-2 h-4 w-4" />
          Search staff, logs, courses
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={handleLogout}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-[#0B1F3A]/[0.10] bg-white/[0.75] px-3 text-sm font-semibold text-[#0B1F3A] shadow-sm transition hover:bg-[#C8A96B]/[0.14]"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
          <div className="hidden h-10 w-10 place-items-center rounded-2xl bg-[#0B1F3A] text-sm font-semibold text-[#C8A96B] sm:grid">
            {user?.fullName?.charAt(0) || 'N'}
          </div>
        </div>
      </div>
    </header>
  )
}
