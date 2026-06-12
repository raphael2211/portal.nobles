'use client'

import React from 'react'
import { CheckCircle2, ClipboardList } from 'lucide-react'
import type { ActivityLog } from '../../types/portal'

export default function TodoSection({ logs }: { logs: ActivityLog[] }) {
  const todos = logs
    .filter((log) => log.tomorrowTodo)
    .slice(0, 4)
    .map((log) => ({ id: log.id, text: log.tomorrowTodo, source: log.createdAt }))

  return (
    <section className="panel">
      <div className="flex items-center justify-between">
        <div>
          <div className="section-kicker">Tomorrow</div>
          <h3 className="section-title mt-1">Todo continuity</h3>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F8F5EF] text-[#7A6A42]">
          <ClipboardList className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {todos.length === 0 && <p className="text-sm text-slate-500">Submit a daily log to create tomorrow's priority.</p>}
        {todos.map((todo) => (
          <div key={todo.id} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white/[0.78] p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
            <div>
              <div className="text-sm font-medium text-slate-800">{todo.text}</div>
              <div className="mt-1 text-xs text-slate-400">From {new Date(todo.source).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
