'use client'

import React, { useState } from 'react'
import { UploadCloud } from 'lucide-react'
import type { CourseType } from '../../types/portal'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../notifications/NotificationProvider'
import Button from '../shared/Button'
import Input from '../shared/Input'

export default function LMSUploadForm() {
  const { createCourse } = useAuth()
  const { addNotification } = useNotifications()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<CourseType>('manual')
  const [resourceUrl, setResourceUrl] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(20)
  const [loading, setLoading] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    const result = await createCourse({ title, description, type, resourceUrl, durationMinutes })
    setLoading(false)
    if (!result.ok) return addNotification({ title: 'Upload failed', message: result.message, type: 'error' })
    addNotification({ title: 'Course uploaded', message: `${title} is available for assignment`, type: 'success' })
    setTitle('')
    setDescription('')
    setType('manual')
    setResourceUrl('')
    setDurationMinutes(20)
  }

  return (
    <form onSubmit={submit} className="panel">
      <div className="flex items-center justify-between">
        <div>
          <div className="section-kicker">Learning</div>
          <h3 className="section-title mt-1">Upload course</h3>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C8A96B]/[0.12] text-[#0B1F3A]">
          <UploadCloud className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Input label="Course title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Premium SOP" />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What staff will learn"
            className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white/[0.90] p-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Course type</span>
          <select value={type} onChange={(event) => setType(event.target.value as CourseType)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#C8A96B] focus:ring-4 focus:ring-[#C8A96B]/[0.20]">
            <option value="manual">Manual</option>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="mixed">Mixed</option>
          </select>
        </label>
        <Input label="Resource URL" value={resourceUrl} onChange={(event) => setResourceUrl(event.target.value)} placeholder="https://..." />
        <Input label="Duration minutes" type="number" value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} />
      </div>

      <div className="mt-5">
        <Button type="submit" disabled={loading} className="w-full">
          <UploadCloud className="h-4 w-4" />
          {loading ? 'Uploading...' : 'Create course'}
        </Button>
      </div>
    </form>
  )
}
