'use client'

import React, { useState } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from './NotificationProvider'

export default function NotificationBell() {
  const { notifications, markNotificationRead } = useAuth()
  const local = useNotifications()
  const unread = notifications.filter((item) => !item.read).length + local.notifications.filter((item) => !item.read).length
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} className="relative grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white/[0.80] text-[#0B1F3A] shadow-sm transition hover:bg-[#C8A96B]/[0.12]" aria-label="Notifications">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">{unread}</span>}
      </button>

      {open && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/[0.70] bg-white/[0.92] p-3 shadow-[0_24px_80px_rgba(31,17,40,0.22)] backdrop-blur-2xl">
          <div className="flex items-center justify-between px-1">
            <div className="font-semibold text-[#0B1F3A]">Notifications</div>
            <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 max-h-96 space-y-2 overflow-auto">
            {notifications.length === 0 && local.notifications.length === 0 && <div className="p-3 text-sm text-slate-500">No notifications</div>}
            {notifications.map((item) => (
              <button
                key={`server-${item.id}`}
                onClick={() => markNotificationRead(item.id)}
                className={`w-full rounded-2xl border p-3 text-left transition hover:bg-[#C8A96B]/[0.12] ${item.read ? 'border-slate-100 bg-white' : 'border-[#C8A96B]/[0.30] bg-[#C8A96B]/[0.16]'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-[#0B1F3A]">{item.title}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">{item.message}</div>
                  </div>
                  {!item.read && <Check className="mt-1 h-4 w-4 text-[#0B1F3A]" />}
                </div>
              </button>
            ))}
            {local.notifications.map((item) => (
              <button
                key={`local-${item.id}`}
                onClick={() => local.markRead(item.id)}
                className={`w-full rounded-2xl border p-3 text-left transition hover:bg-[#F8F5EF] ${item.read ? 'border-slate-100 bg-white' : 'border-[#C8A96B]/[0.40] bg-[#F8F5EF]'}`}
              >
                <div className="text-sm font-semibold text-[#0B1F3A]">{item.title}</div>
                {item.message && <div className="mt-1 text-xs leading-5 text-slate-500">{item.message}</div>}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
