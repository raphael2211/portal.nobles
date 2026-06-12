import fs from 'fs'
import path from 'path'
import { createHash, timingSafeEqual } from 'crypto'
import {
  ActivityEvidence,
  ActivityLog,
  AttendanceLog,
  AuditLog,
  AssignedCourse,
  LMSAssignment,
  LMSCourse,
  PermissionDefinition,
  PortalNotification,
  PortalUser,
  PublicPortalUser,
  Role,
  RoleCoverEntry,
  RoleDefinition,
  RolePermission,
  StaffStatus,
  Todo,
} from '../types/portal'
import { clampDailyKpi, kpiRewardValue, rewardSettings } from './portal-config'
import {
  DEFAULT_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_ROLES,
  isActiveStatus,
  isStaffPortalRole,
  isSuperUserRole,
  normalizeRole,
} from './rbac'

type StoredUser = PortalUser & {
  passwordHash: string
}

type PortalDatabase = {
  users: StoredUser[]
  roles: RoleDefinition[]
  permissions: PermissionDefinition[]
  rolePermissions: RolePermission[]
  activityLogs: ActivityLog[]
  attendanceLogs: AttendanceLog[]
  kpiTransactions: {
    id: number
    userId: number
    logId?: number
    type: 'reward' | 'penalty' | 'cycle_reset'
    points: number
    amount: number
    reason: string
    createdBy: number
    createdAt: string
  }[]
  notifications: PortalNotification[]
  lmsCourses: LMSCourse[]
  lmsAssignments: LMSAssignment[]
  roleCoverMatrix: RoleCoverEntry[]
  todos: Todo[]
  auditLogs: AuditLog[]
  counters: Record<string, number>
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'portal-db.json')
const ATTENDANCE_TIMEZONE = 'Africa/Lagos'
const CHECK_IN_CUTOFF_MINUTES = 8 * 60 + 30

function timestamp() {
  return new Date().toISOString()
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function tomorrow() {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}

function lagosDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ATTENDANCE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const value = (type: string) => parts.find((part) => part.type === type)?.value || ''
  return `${value('year')}-${value('month')}-${value('day')}`
}

function lagosMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: ATTENDANCE_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value || 0)
  return value('hour') * 60 + value('minute')
}

function toCoordinate(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function officeFence() {
  const latitude = toCoordinate(process.env.NOBLES_OFFICE_LAT)
  const longitude = toCoordinate(process.env.NOBLES_OFFICE_LNG)
  const radiusMeters = Number(process.env.NOBLES_CHECKIN_RADIUS_METERS || 150)
  if (latitude === null || longitude === null) return null
  return { latitude, longitude, radiusMeters: Number.isFinite(radiusMeters) ? radiusMeters : 150 }
}

function distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const earthRadius = 6371000
  const toRadians = (value: number) => (value * Math.PI) / 180
  const lat1 = toRadians(a.latitude)
  const lat2 = toRadians(b.latitude)
  const deltaLat = toRadians(b.latitude - a.latitude)
  const deltaLng = toRadians(b.longitude - a.longitude)
  const h =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)))
}

function hashPassword(password: string) {
  return `sha256$${createHash('sha256').update(password).digest('hex')}`
}

function verifyPassword(password: string, passwordHash: string) {
  if (!passwordHash.startsWith('sha256$')) return false
  const actual = Buffer.from(hashPassword(password))
  const expected = Buffer.from(passwordHash)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

function publicUser(user: StoredUser, db?: PortalDatabase): PublicPortalUser {
  const { passwordHash: _passwordHash, ...safeUser } = user
  return {
    ...safeUser,
    permissions: db ? permissionsForRole(db, safeUser.role) : [],
  }
}

function defaultDb(): PortalDatabase {
  const adminHash = hashPassword(process.env.SUPERUSER_PASSWORD || 'admin123')
  const createdAt = daysAgo(18)

  const users: StoredUser[] = [
    {
      id: 1,
      staffId: process.env.SUPERUSER_ID || 'UCHE0001',
      fullName: 'Uche Nobles',
      role: 'superuser',
      department: 'Leadership',
      title: 'Operations Superuser',
      status: 'ACTIVE',
      active: true,
      kpi: 0,
      points: 0,
      createdAt,
      passwordHash: adminHash,
    },
  ]

  const lmsCourses: LMSCourse[] = [
    {
      id: 1,
      title: 'Premium Support SOP',
      description: 'Concierge tone, escalation rules, evidence standards, and client recovery flow.',
      type: 'manual',
      resourceUrl: 'https://example.com/premium-support-sop',
      durationMinutes: 35,
      createdBy: 1,
      createdAt: daysAgo(8),
    },
    {
      id: 2,
      title: 'Daily Log Evidence Masterclass',
      description: 'How to submit clean evidence that makes verification fast and fair.',
      type: 'video',
      resourceUrl: 'https://example.com/evidence-masterclass',
      durationMinutes: 22,
      createdBy: 1,
      createdAt: daysAgo(6),
    },
  ]

  const lmsAssignments: LMSAssignment[] = [
  ]

  return {
    users,
    roles: DEFAULT_ROLES.map((role) => ({ ...role })),
    permissions: DEFAULT_PERMISSIONS.map((permission) => ({ ...permission })),
    rolePermissions: DEFAULT_ROLE_PERMISSIONS.map((permission) => ({ ...permission })),
    activityLogs: [],
    attendanceLogs: [],
    kpiTransactions: [],
    notifications: [],
    lmsCourses,
    lmsAssignments,
    roleCoverMatrix: [],
    todos: [],
    auditLogs: [],
    counters: {
      users: 1,
      activityLogs: 0,
      attendanceLogs: 0,
      kpiTransactions: 0,
      notifications: 0,
      lmsCourses: 2,
      lmsAssignments: 0,
      roleCoverMatrix: 0,
      todos: 0,
      auditLogs: 0,
    },
  }
}

function mergeById<T extends { id: string }>(defaults: T[], records: T[]) {
  const map = new Map<string, T>()
  for (const item of defaults) map.set(item.id, item)
  for (const item of records) map.set(item.id, item)
  return Array.from(map.values())
}

function mergeRolePermissions(defaults: RolePermission[], records: RolePermission[]) {
  const map = new Map<string, RolePermission>()
  for (const item of defaults) map.set(`${item.roleId}:${item.permissionId}`, item)
  for (const item of records) map.set(`${item.roleId}:${item.permissionId}`, item)
  return Array.from(map.values())
}

function migrateDb(db: Partial<PortalDatabase>): PortalDatabase {
  const base = defaultDb()
  const nextDb: PortalDatabase = {
    users: db.users || base.users,
    roles: db.roles || base.roles,
    permissions: db.permissions || base.permissions,
    rolePermissions: db.rolePermissions || base.rolePermissions,
    activityLogs: db.activityLogs || [],
    attendanceLogs: db.attendanceLogs || [],
    kpiTransactions: db.kpiTransactions || [],
    notifications: db.notifications || [],
    lmsCourses: db.lmsCourses || [],
    lmsAssignments: db.lmsAssignments || [],
    roleCoverMatrix: db.roleCoverMatrix || [],
    todos: db.todos || [],
    auditLogs: db.auditLogs || [],
    counters: db.counters || {},
  }

  nextDb.users = nextDb.users.map((user) => ({
    ...user,
    role: normalizeRole(user.role),
    status: (user.status || (user.active !== false ? 'ACTIVE' : 'INACTIVE')) as StaffStatus,
    points: user.points ?? user.kpi ?? 0,
    active: isActiveStatus(user.status, user.active),
    title: user.title || (user.role === 'superuser' ? 'Operations Superuser' : 'Staff Member'),
  }))

  nextDb.roles = mergeById(base.roles, nextDb.roles)
  nextDb.permissions = mergeById(base.permissions, nextDb.permissions)
  nextDb.rolePermissions = mergeRolePermissions(base.rolePermissions, nextDb.rolePermissions)

  nextDb.activityLogs = nextDb.activityLogs.map((log) => {
    const legacyEvidence = (log as ActivityLog & { evidence?: ActivityEvidence[] | string }).evidence
    return {
      ...log,
      evidence: Array.isArray(legacyEvidence)
        ? legacyEvidence
        : typeof legacyEvidence === 'string'
          ? [{ id: `ev_${log.id}`, type: 'link', value: legacyEvidence }]
          : [],
      tomorrowTodo: log.tomorrowTodo || 'Review pending priorities.',
      kpiAssigned: log.kpiAssigned || 0,
      penaltyAssigned: log.penaltyAssigned || 0,
      locked: log.locked || ['verified', 'rewarded', 'penalized', 'rejected'].includes(log.status),
    }
  })

  for (const key of [
    'users',
    'attendanceLogs',
    'activityLogs',
    'kpiTransactions',
    'notifications',
    'lmsCourses',
    'lmsAssignments',
    'roleCoverMatrix',
    'todos',
    'auditLogs',
  ]) {
    const records = nextDb[key as keyof PortalDatabase]
    if (Array.isArray(records)) {
      nextDb.counters[key] = Math.max(nextDb.counters[key] || 0, ...records.map((item) => Number((item as { id?: number }).id || 0)))
    }
  }

  return nextDb
}

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultDb(), null, 2))
  }
}

function readDb(): PortalDatabase {
  ensureDb()
  const raw = fs.readFileSync(DATA_FILE, 'utf8')
  return migrateDb(JSON.parse(raw) as Partial<PortalDatabase>)
}

function writeDb(db: PortalDatabase) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2))
}

function nextId(db: PortalDatabase, key: string) {
  db.counters[key] = (db.counters[key] || 0) + 1
  return db.counters[key]
}

function addAudit(db: PortalDatabase, actorId: number, action: string, entity: string, entityId?: number, metadata?: Record<string, unknown>) {
  db.auditLogs.unshift({
    id: nextId(db, 'auditLogs'),
    actorId,
    action,
    entity,
    entityId,
    metadata,
    createdAt: timestamp(),
  })
}

function addNotification(db: PortalDatabase, userId: number, title: string, message: string, type: PortalNotification['type']) {
  const notification: PortalNotification = {
    id: nextId(db, 'notifications'),
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: timestamp(),
  }
  db.notifications.unshift(notification)
  return notification
}

function permissionsForRole(db: PortalDatabase, role: Role) {
  if (isSuperUserRole(role)) return db.permissions.map((permission) => permission.id)
  return db.rolePermissions.filter((item) => item.roleId === role).map((item) => item.permissionId)
}

function userHasPermission(db: PortalDatabase, userId: number, permission: string) {
  const user = db.users.find((item) => item.id === userId)
  if (!user || !isActiveStatus(user.status, user.active)) return false
  return permissionsForRole(db, user.role).includes(permission)
}

function superuserIds(db: PortalDatabase) {
  return db.users.filter((user) => isSuperUserRole(user.role) && isActiveStatus(user.status, user.active)).map((user) => user.id)
}

export const portalStore = {
  authenticate(staffId: string, password: string) {
    const db = readDb()
    const user = db.users.find((item) => item.staffId.toUpperCase() === staffId.toUpperCase())
    if (!user) return { ok: false as const, message: 'Invalid credentials' }
    if (!isActiveStatus(user.status, user.active)) return { ok: false as const, message: 'Account disabled. Contact administrator.' }
    if (!verifyPassword(password, user.passwordHash)) return { ok: false as const, message: 'Invalid credentials' }

    addAudit(db, user.id, 'login', 'staff_sessions', user.id)
    writeDb(db)
    return { ok: true as const, user: publicUser(user, db) }
  },

  getUser(id: number) {
    const db = readDb()
    const user = db.users.find((item) => item.id === id)
    return user ? publicUser(user, db) : null
  },

  listUsers() {
    const db = readDb()
    return db.users.map((user) => publicUser(user, db)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  userHasPermission(userId: number, permission: string) {
    const db = readDb()
    return userHasPermission(db, userId, permission)
  },

  listRoles() {
    const db = readDb()
    return db.roles
  },

  createStaff(actorId: number, payload: { staffId: string; fullName: string; password: string; department?: string; title?: string; role?: Role; status?: StaffStatus }) {
    const db = readDb()
    const staffId = payload.staffId.trim().toUpperCase()
    if (db.users.some((user) => user.staffId.toUpperCase() === staffId)) {
      return { ok: false as const, message: 'Staff ID exists' }
    }
    const role = payload.role && isStaffPortalRole(payload.role) ? normalizeRole(payload.role) : 'operations_officer'
    const status = payload.status || 'ACTIVE'

    const user: StoredUser = {
      id: nextId(db, 'users'),
      staffId,
      fullName: payload.fullName.trim(),
      role,
      department: payload.department?.trim() || 'Operations',
      title: payload.title?.trim() || 'Staff Member',
      status,
      active: status === 'ACTIVE',
      kpi: 0,
      points: 0,
      createdAt: timestamp(),
      passwordHash: hashPassword(payload.password),
    }

    db.users.unshift(user)
    addNotification(db, user.id, 'Welcome to Nobles Portal', 'Your staff access has been created.', 'success')
    addAudit(db, actorId, 'create_staff', 'users', user.id, { staffId, role, status })
    writeDb(db)
    return { ok: true as const, user: publicUser(user, db) }
  },

  updateStaff(actorId: number, id: number, payload: Partial<Pick<PortalUser, 'active' | 'fullName' | 'department' | 'title' | 'role' | 'status'>> & { password?: string }) {
    const db = readDb()
    const user = db.users.find((item) => item.id === id)
    if (!user) return { ok: false as const, message: 'Staff not found' }
    if (isSuperUserRole(user.role) && payload.role && payload.role !== 'superuser') {
      return { ok: false as const, message: 'Super User role cannot be changed here' }
    }

    if (typeof payload.active === 'boolean') {
      user.active = payload.active
      user.status = payload.active ? 'ACTIVE' : 'INACTIVE'
    }
    if (payload.status) {
      user.status = payload.status
      user.active = payload.status === 'ACTIVE'
    }
    if (payload.role && isStaffPortalRole(payload.role)) user.role = normalizeRole(payload.role)
    if (payload.fullName) user.fullName = payload.fullName
    if (payload.department) user.department = payload.department
    if (payload.title) user.title = payload.title
    if (payload.password) user.passwordHash = hashPassword(payload.password)

    addAudit(db, actorId, 'update_staff', 'users', id, {
      active: payload.active,
      role: payload.role,
      status: payload.status,
      passwordReset: Boolean(payload.password),
    })
    writeDb(db)
    return { ok: true as const, user: publicUser(user, db) }
  },

  deleteStaff(actorId: number, id: number) {
    const db = readDb()
    const user = db.users.find((item) => item.id === id)
    if (!user) return { ok: false as const, message: 'Staff not found' }
    if (user.role === 'superuser') return { ok: false as const, message: 'Superuser access cannot be deleted here' }

    db.users = db.users.filter((item) => item.id !== id)
    db.activityLogs = db.activityLogs.filter((item) => item.userId !== id)
    db.notifications = db.notifications.filter((item) => item.userId !== id)
    db.lmsAssignments = db.lmsAssignments.filter((item) => item.userId !== id)
    db.attendanceLogs = db.attendanceLogs.filter((item) => item.userId !== id)
    db.todos = db.todos.filter((item) => item.userId !== id)
    db.roleCoverMatrix = db.roleCoverMatrix.filter((item) => item.primaryUserId !== id && item.backupUserId !== id)
    addAudit(db, actorId, 'delete_staff', 'users', id)
    writeDb(db)
    return { ok: true as const }
  },

  listActivityLogs(userId?: number) {
    const db = readDb()
    const logs = userId ? db.activityLogs.filter((log) => log.userId === userId) : db.activityLogs
    return logs.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  createActivityLog(userId: number, payload: { summary: string; tomorrowTodo: string; evidence: ActivityEvidence[] }) {
    const db = readDb()
    const user = db.users.find((item) => item.id === userId)
    if (!user || !isStaffPortalRole(user.role) || !isActiveStatus(user.status, user.active)) return { ok: false as const, message: 'Unauthorized' }
    if (!payload.summary?.trim()) return { ok: false as const, message: 'Activity summary is required' }
    if (!payload.tomorrowTodo?.trim()) return { ok: false as const, message: 'Tomorrow todo is required' }
    if (!payload.evidence?.length || payload.evidence.every((item) => !item.value.trim())) {
      return { ok: false as const, message: 'Evidence is required before submission' }
    }

    const log: ActivityLog = {
      id: nextId(db, 'activityLogs'),
      userId,
      summary: payload.summary.trim(),
      tomorrowTodo: payload.tomorrowTodo.trim(),
      evidence: payload.evidence
        .filter((item) => item.value.trim())
        .map((item, index) => ({
          id: item.id || `ev_${Date.now()}_${index}`,
          type: item.type,
          value: item.value.trim(),
          label: item.label?.trim(),
        })),
      status: 'submitted',
      kpiAssigned: 0,
      penaltyAssigned: 0,
      reviewerId: null,
      locked: false,
      createdAt: timestamp(),
    }

    db.activityLogs.unshift(log)
    db.todos.unshift({
      id: nextId(db, 'todos'),
      userId,
      text: payload.tomorrowTodo.trim(),
      completed: false,
      dueDate: tomorrow(),
      createdAt: timestamp(),
    })

    for (const adminId of superuserIds(db)) {
      addNotification(db, adminId, 'New activity log', `${user.fullName} submitted evidence for review.`, 'info')
    }
    addAudit(db, userId, 'submit_activity', 'activity_logs', log.id)
    writeDb(db)
    return { ok: true as const, log }
  },

  listAttendance(userId: number) {
    const db = readDb()
    const logs = db.attendanceLogs.filter((log) => log.userId === userId).sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate))
    return {
      today: logs.find((log) => log.attendanceDate === lagosDateKey()) || null,
      logs,
    }
  },

  checkInAttendance(userId: number, payload: { latitude?: number; longitude?: number; accuracyMeters?: number; note?: string }) {
    const db = readDb()
    const user = db.users.find((item) => item.id === userId)
    if (!user || !isStaffPortalRole(user.role) || !isActiveStatus(user.status, user.active)) return { ok: false as const, message: 'Unauthorized' }

    const latitude = toCoordinate(payload.latitude)
    const longitude = toCoordinate(payload.longitude)
    if (latitude === null || longitude === null) return { ok: false as const, message: 'Location is required for check-in' }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return { ok: false as const, message: 'Invalid location coordinates' }
    }

    const attendanceDate = lagosDateKey()
    const existing = db.attendanceLogs.find((log) => log.userId === userId && log.attendanceDate === attendanceDate)
    if (existing) return { ok: false as const, message: 'You have already checked in today', attendance: existing }

    const fence = officeFence()
    const distance = fence ? distanceMeters({ latitude, longitude }, fence) : undefined
    const withinFence = fence ? Number(distance) <= fence.radiusMeters : undefined
    const fieldWork = withinFence === false
    const late = lagosMinutes() > CHECK_IN_CUTOFF_MINUTES
    const status = fieldWork ? 'FIELD_WORK' : late ? 'LATE' : 'PRESENT'
    const punctuality = fieldWork ? 'FIELD_WORK' : late ? 'LATE' : 'ON_TIME'
    const now = timestamp()
    const attendance: AttendanceLog = {
      id: nextId(db, 'attendanceLogs'),
      userId,
      attendanceDate,
      status,
      punctuality,
      checkInAt: now,
      latitude,
      longitude,
      accuracyMeters: payload.accuracyMeters,
      distanceMeters: distance,
      withinFence,
      note: payload.note?.trim(),
      createdAt: now,
      updatedAt: now,
    }

    db.attendanceLogs.unshift(attendance)
    addAudit(db, userId, 'attendance_check_in', 'attendance_logs', attendance.id, {
      attendanceDate,
      status,
      withinFence,
      distanceMeters: distance,
    })
    writeDb(db)
    return { ok: true as const, attendance }
  },

  checkOutAttendance(userId: number, payload: { latitude?: number; longitude?: number; accuracyMeters?: number; note?: string }) {
    const db = readDb()
    const user = db.users.find((item) => item.id === userId)
    if (!user || !isStaffPortalRole(user.role) || !isActiveStatus(user.status, user.active)) return { ok: false as const, message: 'Unauthorized' }

    const attendanceDate = lagosDateKey()
    const attendance = db.attendanceLogs.find((log) => log.userId === userId && log.attendanceDate === attendanceDate)
    if (!attendance) return { ok: false as const, message: 'Check in before clocking out' }
    if (attendance.checkOutAt) return { ok: false as const, message: 'You have already clocked out today', attendance }

    const latitude = toCoordinate(payload.latitude)
    const longitude = toCoordinate(payload.longitude)
    if (latitude !== null && longitude !== null) {
      attendance.checkOutLatitude = latitude
      attendance.checkOutLongitude = longitude
      attendance.checkOutAccuracyMeters = payload.accuracyMeters
    }
    if (payload.note?.trim()) attendance.note = payload.note.trim()
    attendance.checkOutAt = timestamp()
    attendance.updatedAt = attendance.checkOutAt

    addAudit(db, userId, 'attendance_check_out', 'attendance_logs', attendance.id, { attendanceDate })
    writeDb(db)
    return { ok: true as const, attendance }
  },

  reviewActivityLog(actorId: number, logId: number, payload: { decision: 'reward' | 'penalty' | 'reject'; points?: number; note?: string }) {
    const db = readDb()
    const log = db.activityLogs.find((item) => item.id === logId)
    if (!log) return { ok: false as const, message: 'Log not found' }
    if (log.locked) return { ok: false as const, message: 'Activity log is locked after review' }
    if (!log.evidence.length) return { ok: false as const, message: 'Evidence is required before KPI review' }

    const user = db.users.find((item) => item.id === log.userId)
    if (!user) return { ok: false as const, message: 'Staff not found' }

    const points = clampDailyKpi(payload.points || 0)
    log.reviewerId = actorId
    log.reviewNote = payload.note?.trim()
    log.reviewedAt = timestamp()
    log.locked = true

    if (payload.decision === 'reward') {
      log.status = points > 0 ? 'rewarded' : 'verified'
      log.kpiAssigned = points
      log.penaltyAssigned = 0
      if (points > 0) {
        user.kpi += points
        user.points += points
        db.kpiTransactions.unshift({
          id: nextId(db, 'kpiTransactions'),
          userId: user.id,
          logId: log.id,
          type: 'reward',
          points,
          amount: kpiRewardValue(points),
          reason: payload.note?.trim() || 'Verified daily activity',
          createdBy: actorId,
          createdAt: timestamp(),
        })
        addNotification(db, user.id, 'KPI rewarded', `Your verified log earned ${points} KPI points.`, 'success')
      } else {
        addNotification(db, user.id, 'Log verified', 'Your activity log was verified with no KPI change.', 'info')
      }
    }

    if (payload.decision === 'penalty') {
      log.status = 'penalized'
      log.kpiAssigned = 0
      log.penaltyAssigned = points
      user.kpi = Math.max(0, user.kpi - points)
      user.points = Math.max(0, user.points - points)
      db.kpiTransactions.unshift({
        id: nextId(db, 'kpiTransactions'),
        userId: user.id,
        logId: log.id,
        type: 'penalty',
        points: -points,
        amount: -kpiRewardValue(points),
        reason: payload.note?.trim() || 'Verified issue requiring KPI penalty',
        createdBy: actorId,
        createdAt: timestamp(),
      })
      addNotification(db, user.id, 'KPI penalized', `Your reviewed log received a ${points} KPI penalty.`, 'warning')
    }

    if (payload.decision === 'reject') {
      log.status = 'rejected'
      log.kpiAssigned = 0
      log.penaltyAssigned = 0
      addNotification(db, user.id, 'Log rejected', payload.note?.trim() || 'Your log needs stronger evidence.', 'error')
    }

    addAudit(db, actorId, `review_activity_${payload.decision}`, 'activity_logs', log.id, { points })
    writeDb(db)
    return { ok: true as const, log, user: publicUser(user) }
  },

  listNotifications(userId: number) {
    const db = readDb()
    return db.notifications.filter((item) => item.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  markNotification(userId: number, id: number) {
    const db = readDb()
    const notification = db.notifications.find((item) => item.id === id && item.userId === userId)
    if (!notification) return { ok: false as const, message: 'Notification not found' }
    notification.read = true
    writeDb(db)
    return { ok: true as const, notification }
  },

  listCourses() {
    const db = readDb()
    return db.lmsCourses.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  createCourse(actorId: number, payload: Omit<LMSCourse, 'id' | 'createdAt' | 'createdBy'>) {
    const db = readDb()
    if (!payload.title?.trim()) return { ok: false as const, message: 'Course title is required' }
    const course: LMSCourse = {
      id: nextId(db, 'lmsCourses'),
      title: payload.title.trim(),
      description: payload.description.trim(),
      type: payload.type,
      resourceUrl: payload.resourceUrl.trim(),
      durationMinutes: Number(payload.durationMinutes || 0),
      createdBy: actorId,
      createdAt: timestamp(),
    }
    db.lmsCourses.unshift(course)
    addAudit(db, actorId, 'create_course', 'lms_courses', course.id)
    writeDb(db)
    return { ok: true as const, course }
  },

  assignCourse(actorId: number, courseId: number, userId: number) {
    const db = readDb()
    const course = db.lmsCourses.find((item) => item.id === courseId)
    const user = db.users.find((item) => item.id === userId)
    if (!course || !user) return { ok: false as const, message: 'Course or staff not found' }
    if (!isStaffPortalRole(user.role)) return { ok: false as const, message: 'Courses can only be assigned to staff roles' }
    const existing = db.lmsAssignments.find((item) => item.courseId === courseId && item.userId === userId)
    if (existing) return { ok: true as const, assignment: existing }

    const assignment: LMSAssignment = {
      id: nextId(db, 'lmsAssignments'),
      courseId,
      userId,
      status: 'pending',
      progress: 0,
      assignedAt: timestamp(),
    }
    db.lmsAssignments.unshift(assignment)
    addNotification(db, userId, 'LMS assigned', `${course.title} has been assigned to you.`, 'info')
    addAudit(db, actorId, 'assign_course', 'lms_assignments', assignment.id, { courseId, userId })
    writeDb(db)
    return { ok: true as const, assignment }
  },

  listAssignedCourses(userId: number): AssignedCourse[] {
    const db = readDb()
    return db.lmsAssignments
      .filter((assignment) => assignment.userId === userId)
      .map((assignment) => ({
        ...assignment,
        course: db.lmsCourses.find((course) => course.id === assignment.courseId) as LMSCourse,
      }))
      .filter((assignment) => Boolean(assignment.course))
      .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt))
  },

  updateCourseProgress(userId: number, assignmentId: number, progress: number) {
    const db = readDb()
    const assignment = db.lmsAssignments.find((item) => item.id === assignmentId && item.userId === userId)
    if (!assignment) return { ok: false as const, message: 'Assignment not found' }
    assignment.progress = Math.min(100, Math.max(0, Math.round(progress)))
    assignment.status = assignment.progress >= 100 ? 'completed' : assignment.progress > 0 ? 'in-progress' : 'pending'
    assignment.completedAt = assignment.status === 'completed' ? timestamp() : undefined
    if (assignment.status === 'completed') {
      addNotification(db, userId, 'LMS completed', 'Course progress has been marked complete.', 'success')
    }
    writeDb(db)
    return { ok: true as const, assignment }
  },

  listRoleCover() {
    const db = readDb()
    return db.roleCoverMatrix.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  },

  upsertRoleCover(actorId: number, payload: Omit<RoleCoverEntry, 'id' | 'updatedAt'> & { id?: number }) {
    const db = readDb()
    const existing = payload.id ? db.roleCoverMatrix.find((item) => item.id === payload.id) : null
    if (existing) {
      existing.functionName = payload.functionName
      existing.primaryUserId = payload.primaryUserId
      existing.backupUserId = payload.backupUserId
      existing.readiness = payload.readiness
      existing.temporaryPermissions = payload.temporaryPermissions
      existing.updatedAt = timestamp()
      addAudit(db, actorId, 'update_role_cover', 'role_cover_matrix', existing.id)
      writeDb(db)
      return { ok: true as const, entry: existing }
    }

    const entry: RoleCoverEntry = {
      id: nextId(db, 'roleCoverMatrix'),
      functionName: payload.functionName,
      primaryUserId: payload.primaryUserId,
      backupUserId: payload.backupUserId,
      readiness: payload.readiness,
      temporaryPermissions: payload.temporaryPermissions,
      updatedAt: timestamp(),
    }
    db.roleCoverMatrix.unshift(entry)
    addAudit(db, actorId, 'create_role_cover', 'role_cover_matrix', entry.id)
    writeDb(db)
    return { ok: true as const, entry }
  },

  analytics() {
    const db = readDb()
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000
    const inWindow = (date: string, days: number) => now - new Date(date).getTime() <= days * dayMs

    const reviewedStatuses = ['verified', 'rewarded', 'penalized', 'rejected']
    const dailyLogs = db.activityLogs.filter((log) => inWindow(log.createdAt, 1))
    const weeklyLogs = db.activityLogs.filter((log) => inWindow(log.createdAt, 7))
    const monthlyLogs = db.activityLogs.filter((log) => inWindow(log.createdAt, rewardSettings.cycleDays))
    const transactions = db.kpiTransactions.filter((item) => inWindow(item.createdAt, rewardSettings.cycleDays))
    const activeStaff = db.users.filter((user) => isStaffPortalRole(user.role) && isActiveStatus(user.status, user.active))
    const staffAssignments = db.lmsAssignments.filter((assignment) => activeStaff.some((staff) => staff.id === assignment.userId))

    return {
      daily: summarizeLogs(dailyLogs),
      weekly: summarizeLogs(weeklyLogs),
      monthly: summarizeLogs(monthlyLogs),
      totalStaff: activeStaff.length,
      pendingReviews: db.activityLogs.filter((log) => log.status === 'submitted' || log.status === 'under_review').length,
      totalKpi: activeStaff.reduce((sum, user) => sum + user.kpi, 0),
      payout: kpiRewardValue(activeStaff.reduce((sum, user) => sum + user.kpi, 0)),
      rewards: transactions.filter((item) => item.type === 'reward').reduce((sum, item) => sum + item.points, 0),
      penalties: Math.abs(transactions.filter((item) => item.type === 'penalty').reduce((sum, item) => sum + item.points, 0)),
      verificationRate: monthlyLogs.length
        ? Math.round((monthlyLogs.filter((log) => reviewedStatuses.includes(log.status)).length / monthlyLogs.length) * 100)
        : 0,
      lmsCompletion: staffAssignments.length
        ? Math.round((staffAssignments.filter((assignment) => assignment.status === 'completed').length / staffAssignments.length) * 100)
        : 0,
      rankings: activeStaff
        .slice()
        .sort((a, b) => b.kpi - a.kpi)
        .map((user) => publicUser(user, db)),
    }
  },
}

function summarizeLogs(logs: ActivityLog[]) {
  const reviewed = logs.filter((log) => ['verified', 'rewarded', 'penalized', 'rejected'].includes(log.status)).length
  const rewards = logs.reduce((sum, log) => sum + log.kpiAssigned, 0)
  const penalties = logs.reduce((sum, log) => sum + log.penaltyAssigned, 0)
  return {
    logs: logs.length,
    rewards,
    penalties,
    pending: logs.filter((log) => log.status === 'submitted' || log.status === 'under_review').length,
    verificationRate: logs.length ? Math.round((reviewed / logs.length) * 100) : 0,
  }
}
