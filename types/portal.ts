export type Role =
  | 'superuser'
  | 'manager'
  | 'admin_supervisor'
  | 'marketer'
  | 'loan_officer'
  | 'digital_officer'
  | 'account_officer'
  | 'operations_officer'
  | 'staff'

export type StaffStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED'

export type AttendanceState = 'PRESENT' | 'LATE' | 'ABSENT' | 'FIELD_WORK' | 'APPROVED_LEAVE'

export type AttendancePunctuality = 'ON_TIME' | 'LATE' | 'FIELD_WORK' | 'EXCUSED'

export type ActivityStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'rewarded'
  | 'penalized'
  | 'rejected'

export type EvidenceType = 'text' | 'image' | 'video' | 'link'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export type CourseStatus = 'pending' | 'in-progress' | 'completed'

export type CourseType = 'video' | 'pdf' | 'manual' | 'mixed'

export type ReadinessLevel = 'Ready now' | 'Needs briefing' | 'Training' | 'Unavailable'

export type PortalUser = {
  id: number
  staffId: string
  fullName: string
  role: Role
  department?: string
  title?: string
  status: StaffStatus
  active: boolean
  kpi: number
  points: number
  createdAt: string
}

export type RoleDefinition = {
  id: Role
  name: string
  description: string
}

export type PermissionDefinition = {
  id: string
  label: string
  description: string
}

export type RolePermission = {
  roleId: Role
  permissionId: string
}

export type ActivityEvidence = {
  id: string
  type: EvidenceType
  value: string
  label?: string
}

export type ActivityLog = {
  id: number
  userId: number
  summary: string
  tomorrowTodo: string
  evidence: ActivityEvidence[]
  status: ActivityStatus
  kpiAssigned: number
  penaltyAssigned: number
  reviewerId?: number | null
  reviewNote?: string
  locked: boolean
  createdAt: string
  reviewedAt?: string
}

export type KPITransaction = {
  id: number
  userId: number
  logId?: number
  type: 'reward' | 'penalty' | 'cycle_reset'
  points: number
  amount: number
  reason: string
  createdBy: number
  createdAt: string
}

export type PortalNotification = {
  id: number
  userId: number
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: string
}

export type LMSCourse = {
  id: number
  title: string
  description: string
  type: CourseType
  resourceUrl: string
  durationMinutes: number
  createdBy: number
  createdAt: string
}

export type LMSAssignment = {
  id: number
  courseId: number
  userId: number
  status: CourseStatus
  progress: number
  assignedAt: string
  completedAt?: string
}

export type AssignedCourse = LMSAssignment & {
  course: LMSCourse
}

export type RoleCoverEntry = {
  id: number
  functionName: string
  primaryUserId: number
  backupUserId: number
  readiness: ReadinessLevel
  temporaryPermissions: string
  updatedAt: string
}

export type Todo = {
  id: number
  userId: number
  text: string
  completed: boolean
  dueDate: string
  createdAt: string
}

export type AttendanceLog = {
  id: number
  userId: number
  attendanceDate: string
  status: AttendanceState
  punctuality: AttendancePunctuality
  checkInAt: string
  checkOutAt?: string
  latitude: number
  longitude: number
  accuracyMeters?: number
  distanceMeters?: number
  withinFence?: boolean
  checkOutLatitude?: number
  checkOutLongitude?: number
  checkOutAccuracyMeters?: number
  note?: string
  createdAt: string
  updatedAt: string
}

export type RewardSettings = {
  kpiValue: number
  monthlyTarget: number
  dailyMax: number
  cycleDays: number
}

export type AuditLog = {
  id: number
  actorId: number
  action: string
  entity: string
  entityId?: number
  createdAt: string
  metadata?: Record<string, unknown>
}

export type PublicPortalUser = Omit<PortalUser, 'points'> & {
  points?: number
  permissions?: string[]
}

export type SummaryMetrics = {
  logs: number
  rewards: number
  penalties: number
  pending: number
  verificationRate: number
}

export type AdminAnalytics = {
  daily: SummaryMetrics
  weekly: SummaryMetrics
  monthly: SummaryMetrics
  totalStaff: number
  pendingReviews: number
  totalKpi: number
  payout: number
  rewards: number
  penalties: number
  verificationRate: number
  lmsCompletion: number
  rankings: PublicPortalUser[]
}
