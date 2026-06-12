"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type {
  ActivityEvidence,
  ActivityLog,
  AdminAnalytics,
  AttendanceLog,
  AssignedCourse,
  CourseType,
  LMSCourse,
  PortalNotification,
  PublicPortalUser,
  ReadinessLevel,
  Role,
  RoleCoverEntry,
} from '../types/portal'

export type { ActivityLog, Role }
export type User = PublicPortalUser

type LoginResult = {
  ok: boolean
  message?: string
  user?: User
}

type AuthContextType = {
  loading: boolean
  user: User | null
  users: User[]
  activityLogs: ActivityLog[]
  notifications: PortalNotification[]
  courses: LMSCourse[]
  assignedCourses: AssignedCourse[]
  roleCover: RoleCoverEntry[]
  analytics: AdminAnalytics | null
  attendanceLogs: AttendanceLog[]
  todayAttendance: AttendanceLog | null
  login: (staffId: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
  refreshAdminData: () => Promise<void>
  refreshStaffData: () => Promise<void>
  addActivity: (payload: { summary: string; tomorrowTodo: string; evidence: ActivityEvidence[] }) => Promise<{ ok: boolean; message?: string; log?: ActivityLog }>
  checkIn: (payload: { latitude: number; longitude: number; accuracyMeters?: number; note?: string }) => Promise<{ ok: boolean; message?: string; attendance?: AttendanceLog }>
  checkOut: (payload: { latitude?: number; longitude?: number; accuracyMeters?: number; note?: string }) => Promise<{ ok: boolean; message?: string; attendance?: AttendanceLog }>
  reviewActivity: (logId: number, payload: { decision: 'reward' | 'penalty' | 'reject'; points?: number; note?: string }) => Promise<{ ok: boolean; message?: string }>
  registerStaff: (payload: { staffId: string; fullName: string; password: string; department?: string; title?: string; role?: Role }) => Promise<{ ok: boolean; message?: string }>
  deleteStaff: (id: number) => Promise<{ ok: boolean; message?: string }>
  setActive: (id: number, active: boolean) => Promise<{ ok: boolean; message?: string }>
  updateStaff: (id: number, payload: { fullName?: string; department?: string; title?: string; password?: string; active?: boolean; role?: Role; status?: string }) => Promise<{ ok: boolean; message?: string }>
  createCourse: (payload: { title: string; description: string; type: CourseType; resourceUrl: string; durationMinutes: number }) => Promise<{ ok: boolean; message?: string }>
  assignCourse: (courseId: number, userId: number) => Promise<{ ok: boolean; message?: string }>
  updateCourseProgress: (assignmentId: number, progress: number) => Promise<{ ok: boolean; message?: string }>
  upsertRoleCover: (payload: { id?: number; functionName: string; primaryUserId: number; backupUserId: number; readiness: ReadinessLevel; temporaryPermissions: string }) => Promise<{ ok: boolean; message?: string }>
  markNotificationRead: (id: number) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function parseResponse<T>(res: Response): Promise<T & { ok?: boolean; message?: string }> {
  return (await res.json()) as T & { ok?: boolean; message?: string }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const [courses, setCourses] = useState<LMSCourse[]>([])
  const [assignedCourses, setAssignedCourses] = useState<AssignedCourse[]>([])
  const [roleCover, setRoleCover] = useState<RoleCoverEntry[]>([])
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([])
  const [todayAttendance, setTodayAttendance] = useState<AttendanceLog | null>(null)

  async function fetchNotifications() {
    const res = await fetch('/api/notifications')
    if (!res.ok) return
    const data = await parseResponse<{ notifications: PortalNotification[] }>(res)
    if (data.ok) setNotifications(data.notifications || [])
  }

  async function refreshAdminData() {
    const [staffRes, activityRes, analyticsRes, courseRes, roleRes] = await Promise.all([
      fetch('/api/admin/staff'),
      fetch('/api/admin/activity'),
      fetch('/api/admin/analytics'),
      fetch('/api/admin/lms'),
      fetch('/api/admin/role-cover'),
    ])

    if (staffRes.ok) {
      const data = await parseResponse<{ users: User[] }>(staffRes)
      if (data.ok) setUsers(data.users || [])
    }

    if (activityRes.ok) {
      const data = await parseResponse<{ logs: ActivityLog[] }>(activityRes)
      if (data.ok) setActivityLogs(data.logs || [])
    }

    if (analyticsRes.ok) {
      const data = await parseResponse<{ analytics: AdminAnalytics }>(analyticsRes)
      if (data.ok) setAnalytics(data.analytics)
    }

    if (courseRes.ok) {
      const data = await parseResponse<{ courses: LMSCourse[] }>(courseRes)
      if (data.ok) setCourses(data.courses || [])
    }

    if (roleRes.ok) {
      const data = await parseResponse<{ entries: RoleCoverEntry[] }>(roleRes)
      if (data.ok) setRoleCover(data.entries || [])
    }

    await fetchNotifications()
  }

  async function refreshStaffData() {
    const [activityRes, lmsRes, attendanceRes] = await Promise.all([fetch('/api/activity'), fetch('/api/lms'), fetch('/api/attendance')])

    if (activityRes.ok) {
      const data = await parseResponse<{ logs: ActivityLog[] }>(activityRes)
      if (data.ok) setActivityLogs(data.logs || [])
    }

    if (lmsRes.ok) {
      const data = await parseResponse<{ courses: AssignedCourse[] }>(lmsRes)
      if (data.ok) setAssignedCourses(data.courses || [])
    }

    if (attendanceRes.ok) {
      const data = await parseResponse<{ logs: AttendanceLog[]; today: AttendanceLog | null }>(attendanceRes)
      if (data.ok) {
        setAttendanceLogs(data.logs || [])
        setTodayAttendance(data.today || null)
      }
    }

    await fetchNotifications()
  }

  async function fetchCurrent() {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/me')
      const data = await parseResponse<{ user: User | null }>(res)
      if (data.ok && data.user) {
        setUser(data.user)
        if (data.user.role === 'superuser') await refreshAdminData()
        else await refreshStaffData()
      } else {
        setUser(null)
      }
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchCurrent()
  }, [])

  const login = async (staffId: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, password }),
      })
      const data = await parseResponse<{ user?: User }>(res)
      if (data.ok && data.user) {
        setUser(data.user)
        if (data.user.role === 'superuser') await refreshAdminData()
        else await refreshStaffData()
        return { ok: true, user: data.user }
      }
      return { ok: false, message: data.message || 'Invalid credentials' }
    } catch (err) {
      return { ok: false, message: 'Network error' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    setUser(null)
    setUsers([])
    setActivityLogs([])
    setNotifications([])
    setCourses([])
    setAssignedCourses([])
    setRoleCover([])
    setAnalytics(null)
    setAttendanceLogs([])
    setTodayAttendance(null)
  }

  const addActivity = async (payload: { summary: string; tomorrowTodo: string; evidence: ActivityEvidence[] }) => {
    const res = await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await parseResponse<{ log?: ActivityLog }>(res)
    if (data.ok && data.log) {
      setActivityLogs((prev) => [data.log as ActivityLog, ...prev])
      await refreshStaffData()
      return { ok: true, log: data.log }
    }
    return { ok: false, message: data.message || 'Could not submit activity' }
  }

  const saveAttendance = async (payload: { action: 'check_in' | 'check_out'; latitude?: number; longitude?: number; accuracyMeters?: number; note?: string }) => {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await parseResponse<{ attendance?: AttendanceLog }>(res)
    if (data.ok && data.attendance) {
      setTodayAttendance(data.attendance)
      await refreshStaffData()
      return { ok: true, attendance: data.attendance }
    }
    return { ok: false, message: data.message || 'Could not save attendance' }
  }

  const checkIn = async (payload: { latitude: number; longitude: number; accuracyMeters?: number; note?: string }) => saveAttendance({ action: 'check_in', ...payload })

  const checkOut = async (payload: { latitude?: number; longitude?: number; accuracyMeters?: number; note?: string }) => saveAttendance({ action: 'check_out', ...payload })

  const reviewActivity = async (logId: number, payload: { decision: 'reward' | 'penalty' | 'reject'; points?: number; note?: string }) => {
    const res = await fetch(`/api/admin/activity/${logId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await parseResponse<Record<string, unknown>>(res)
    if (data.ok) {
      await refreshAdminData()
      return { ok: true }
    }
    return { ok: false, message: data.message || 'Could not review log' }
  }

  const registerStaff = async (payload: { staffId: string; fullName: string; password: string; department?: string; title?: string; role?: Role }) => {
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await parseResponse<Record<string, unknown>>(res)
    if (data.ok) {
      await refreshAdminData()
      return { ok: true }
    }
    return { ok: false, message: data.message || 'Could not register staff' }
  }

  const updateStaff = async (id: number, payload: { fullName?: string; department?: string; title?: string; password?: string; active?: boolean; role?: Role; status?: string }) => {
    const res = await fetch(`/api/admin/staff/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await parseResponse<Record<string, unknown>>(res)
    if (data.ok) {
      await refreshAdminData()
      return { ok: true }
    }
    return { ok: false, message: data.message || 'Could not update staff' }
  }

  const deleteStaff = async (id: number) => {
    const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' })
    const data = await parseResponse<Record<string, unknown>>(res)
    if (data.ok) {
      await refreshAdminData()
      return { ok: true }
    }
    return { ok: false, message: data.message || 'Could not delete staff' }
  }

  const setActive = async (id: number, active: boolean) => updateStaff(id, { active })

  const createCourse = async (payload: { title: string; description: string; type: CourseType; resourceUrl: string; durationMinutes: number }) => {
    const res = await fetch('/api/admin/lms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await parseResponse<Record<string, unknown>>(res)
    if (data.ok) {
      await refreshAdminData()
      return { ok: true }
    }
    return { ok: false, message: data.message || 'Could not create course' }
  }

  const assignCourse = async (courseId: number, userId: number) => {
    const res = await fetch('/api/admin/lms/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, userId }),
    })
    const data = await parseResponse<Record<string, unknown>>(res)
    if (data.ok) {
      await refreshAdminData()
      return { ok: true }
    }
    return { ok: false, message: data.message || 'Could not assign course' }
  }

  const updateCourseProgress = async (assignmentId: number, progress: number) => {
    const res = await fetch('/api/lms', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignmentId, progress }),
    })
    const data = await parseResponse<Record<string, unknown>>(res)
    if (data.ok) {
      await refreshStaffData()
      return { ok: true }
    }
    return { ok: false, message: data.message || 'Could not update progress' }
  }

  const upsertRoleCover = async (payload: { id?: number; functionName: string; primaryUserId: number; backupUserId: number; readiness: ReadinessLevel; temporaryPermissions: string }) => {
    const res = await fetch('/api/admin/role-cover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await parseResponse<Record<string, unknown>>(res)
    if (data.ok) {
      await refreshAdminData()
      return { ok: true }
    }
    return { ok: false, message: data.message || 'Could not save role cover' }
  }

  const markNotificationRead = async (id: number) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
    } catch {}
  }

  const value = useMemo(
    () => ({
      loading,
      user,
      users,
      activityLogs,
      notifications,
      courses,
      assignedCourses,
      roleCover,
      analytics,
      attendanceLogs,
      todayAttendance,
      login,
      logout,
      refreshAdminData,
      refreshStaffData,
      addActivity,
      checkIn,
      checkOut,
      reviewActivity,
      registerStaff,
      deleteStaff,
      setActive,
      updateStaff,
      createCourse,
      assignCourse,
      updateCourseProgress,
      upsertRoleCover,
      markNotificationRead,
    }),
    [loading, user, users, activityLogs, notifications, courses, assignedCourses, roleCover, analytics, attendanceLogs, todayAttendance],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
