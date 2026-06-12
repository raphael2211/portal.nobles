'use client'

import React, { useMemo, useState } from 'react'
import { LogOut, MapPin, Navigation } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../shared/Button'
import StatusBadge from '../shared/StatusBadge'

function formatTime(value?: string) {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function attendanceLabel(value?: string) {
  return (value || 'not_checked_in').toLowerCase()
}

export default function GeoAttendanceCard() {
  const { todayAttendance, checkIn, checkOut } = useAuth()
  const [loading, setLoading] = useState<'check_in' | 'check_out' | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const detail = useMemo(() => {
    if (!todayAttendance) return 'Awaiting today\'s check-in'
    if (todayAttendance.checkOutAt) return `Clocked out ${formatTime(todayAttendance.checkOutAt)}`
    return `Checked in ${formatTime(todayAttendance.checkInAt)}`
  }, [todayAttendance])

  const capture = (action: 'check_in' | 'check_out') => {
    setMessage(null)
    if (!navigator.geolocation) {
      setMessage('Location is not available on this device.')
      return
    }

    setLoading(action)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const payload = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: Math.round(position.coords.accuracy),
        }
        const result = action === 'check_in' ? await checkIn(payload) : await checkOut(payload)
        setLoading(null)
        setMessage(result.ok ? (action === 'check_in' ? 'Checked in with location.' : 'Clocked out.') : result.message || 'Attendance could not be saved.')
      },
      () => {
        setLoading(null)
        setMessage('Allow location access to save attendance.')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  return (
    <section className="panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C8A96B]/[0.12] text-[#0B1F3A]">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <div className="section-kicker">Geo attendance</div>
              <h3 className="section-title mt-1">Today&apos;s check-in</h3>
            </div>
            <StatusBadge value={attendanceLabel(todayAttendance?.status)} />
          </div>
          <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-3">
            <div>
              <span className="font-semibold text-[#0B1F3A]">In:</span> {formatTime(todayAttendance?.checkInAt)}
            </div>
            <div>
              <span className="font-semibold text-[#0B1F3A]">Out:</span> {formatTime(todayAttendance?.checkOutAt)}
            </div>
            <div>
              <span className="font-semibold text-[#0B1F3A]">Accuracy:</span> {todayAttendance?.accuracyMeters ? `${todayAttendance.accuracyMeters}m` : 'Pending'}
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-600">{detail}</p>
          {message && <p className={`mt-3 text-sm font-semibold ${message.includes('Allow') || message.includes('could not') || message.includes('not available') ? 'text-rose-700' : 'text-emerald-700'}`}>{message}</p>}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          <Button type="button" onClick={() => capture('check_in')} disabled={Boolean(loading) || Boolean(todayAttendance?.checkInAt)}>
            <Navigation className="h-4 w-4" />
            {loading === 'check_in' ? 'Locating...' : 'Check in'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => capture('check_out')} disabled={Boolean(loading) || !todayAttendance?.checkInAt || Boolean(todayAttendance?.checkOutAt)}>
            <LogOut className="h-4 w-4" />
            {loading === 'check_out' ? 'Locating...' : 'Clock out'}
          </Button>
        </div>
      </div>
    </section>
  )
}
