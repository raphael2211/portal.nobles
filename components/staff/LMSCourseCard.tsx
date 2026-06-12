'use client'

import React from 'react'
import { BookOpen, ExternalLink } from 'lucide-react'
import type { AssignedCourse } from '../../types/portal'
import StatusBadge from '../shared/StatusBadge'

export default function LMSCourseCard({ assignment, onProgress }: { assignment: AssignedCourse; onProgress?: (progress: number) => void }) {
  return (
    <article className="panel">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#0B1F3A]" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{assignment.course.type}</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-[#0B1F3A]">{assignment.course.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{assignment.course.description}</p>
        </div>
        <StatusBadge value={assignment.status} />
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span>Progress</span>
          <span>{assignment.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-[#0B1F3A] to-[#C8A96B]" style={{ width: `${assignment.progress}%` }} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <a
          href={assignment.course.resourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl border border-[#C8A96B]/[0.30] bg-[#C8A96B]/[0.12] px-3 py-2 text-sm font-semibold text-[#0B1F3A]"
        >
          Open resource
          <ExternalLink className="h-4 w-4" />
        </a>
        {onProgress && assignment.progress < 100 && (
          <button
            onClick={() => onProgress(Math.min(100, assignment.progress + 25))}
            className="rounded-2xl bg-[#0B1F3A] px-3 py-2 text-sm font-semibold text-white"
          >
            Add 25%
          </button>
        )}
      </div>
    </article>
  )
}
