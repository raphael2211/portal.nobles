'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useNotifications } from './NotificationProvider'

export default function NotificationPanel({ onClose }: { onClose?: () => void }) {
  const { notifications, markRead, remove, clear } = useNotifications()

  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="glass p-3 rounded-xl shadow-lg w-80">
      <div className="flex items-center justify-between mb-2">
        <strong>Notifications</strong>
        <div className="flex items-center gap-2">
          <button onClick={() => clear()} className="text-xs text-slate-500">Clear</button>
          <button onClick={() => onClose?.()} className="text-xs text-slate-500">Close</button>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-auto">
        {notifications.length === 0 && <div className="text-sm text-slate-500">No notifications</div>}
        {notifications.map(n => (
          <motion.div key={n.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`p-2 rounded-md ${n.read ? 'bg-slate-50' : 'bg-white'}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium">{n.title}</div>
                {n.message && <div className="text-xs text-slate-500">{n.message}</div>}
                <div className="text-xxs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex flex-col gap-1 ml-2">
                <button onClick={() => markRead(n.id)} className="text-xs text-slate-500">Mark</button>
                <button onClick={() => remove(n.id)} className="text-xs text-rose-500">Dismiss</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
