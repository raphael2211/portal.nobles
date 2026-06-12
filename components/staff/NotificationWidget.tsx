'use client'

import React from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function NotificationWidget() {
  const { notifications, markNotificationRead } = useAuth()
  const latest = notifications.slice(0, 4)

  return (
    <section className="panel">
      <div className="flex items-center justify-between">
        <div>
          <div className="section-kicker">Signals</div>
          <h3 className="section-title mt-1">Notifications</h3>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C8A96B]/[0.12] text-[#0B1F3A]">
          <Bell className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {latest.length === 0 && <p className="text-sm text-slate-500">No active notifications.</p>}
        {latest.map((item) => (
          <button
            key={item.id}
            onClick={() => markNotificationRead(item.id)}
            className={`w-full rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${
              item.read ? 'border-slate-100 bg-white/[0.60]' : 'border-[#C8A96B]/[0.30] bg-[#C8A96B]/[0.16]'
            }`}
          >
            <div className="text-sm font-semibold text-[#0B1F3A]">{item.title}</div>
            <div className="mt-1 text-xs leading-5 text-slate-500">{item.message}</div>
          </button>
        ))}
      </div>
    </section>
  )
}
