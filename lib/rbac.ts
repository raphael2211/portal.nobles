import type { Role, StaffStatus } from '../types/portal'

export const SUPERUSER_ROLE: Role = 'superuser'

export const STAFF_ASSIGNABLE_ROLES: Role[] = [
  'manager',
  'admin_supervisor',
  'marketer',
  'loan_officer',
  'digital_officer',
  'account_officer',
  'operations_officer',
]

export const ROLE_LABELS: Record<Role, string> = {
  superuser: 'Super User',
  manager: 'Manager',
  admin_supervisor: 'Admin Supervisor',
  marketer: 'Marketer',
  loan_officer: 'Loan Officer',
  digital_officer: 'Digital Officer',
  account_officer: 'Account Officer',
  operations_officer: 'Operations Officer',
  staff: 'Staff',
}

export const STAFF_STATUS_OPTIONS: StaffStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED']

export const DEFAULT_ROLES = [
  { id: 'superuser' as Role, name: 'Super User', description: 'Full portal control, staff setup, permissions, and reviews.' },
  { id: 'manager' as Role, name: 'Manager', description: 'Team leadership workspace and assigned staff tools.' },
  { id: 'admin_supervisor' as Role, name: 'Admin Supervisor', description: 'Administrative supervision and staff operations workspace.' },
  { id: 'marketer' as Role, name: 'Marketer', description: 'Portfolio growth, daily work logging, and field activity workspace.' },
  { id: 'loan_officer' as Role, name: 'Loan Officer', description: 'Loan workflow, daily work logging, and assigned training workspace.' },
  { id: 'digital_officer' as Role, name: 'Digital Officer', description: 'Digital operations, daily work logging, and assigned training workspace.' },
  { id: 'account_officer' as Role, name: 'Account Officer', description: 'Member/account operations, daily work logging, and assigned training workspace.' },
  { id: 'operations_officer' as Role, name: 'Operations Officer', description: 'Operations workspace, daily work logging, and assigned training.' },
]

export const DEFAULT_PERMISSIONS = [
  { id: 'admin.dashboard.view', label: 'View Admin Dashboard', description: 'Open executive command dashboard.' },
  { id: 'staff.manage', label: 'Manage Staff', description: 'Create staff, assign roles, change status, and reset passwords.' },
  { id: 'lms.manage', label: 'Manage LMS', description: 'Create and assign learning content.' },
  { id: 'role_cover.manage', label: 'Manage Role Cover', description: 'Configure operational cover rules.' },
  { id: 'staff.dashboard.view', label: 'View Staff Dashboard', description: 'Open personal staff dashboard.' },
  { id: 'activity.view', label: 'View Activity Logs', description: 'View own daily logs.' },
  { id: 'activity.create', label: 'Create Activity Logs', description: 'Submit daily activity evidence.' },
  { id: 'attendance.view', label: 'View Attendance', description: 'View own attendance records.' },
  { id: 'attendance.check_in', label: 'Geo Check In', description: 'Clock in and clock out with browser location.' },
  { id: 'lms.view', label: 'View LMS', description: 'Open assigned learning content.' },
  { id: 'notifications.view', label: 'View Notifications', description: 'Read personal notifications.' },
]

const STAFF_PERMISSION_IDS = [
  'staff.dashboard.view',
  'activity.view',
  'activity.create',
  'attendance.view',
  'attendance.check_in',
  'lms.view',
  'notifications.view',
]

const ADMIN_PERMISSION_IDS = DEFAULT_PERMISSIONS.map((permission) => permission.id)

export const DEFAULT_ROLE_PERMISSIONS = [
  ...ADMIN_PERMISSION_IDS.map((permissionId) => ({ roleId: 'superuser' as Role, permissionId })),
  ...STAFF_ASSIGNABLE_ROLES.flatMap((roleId) => STAFF_PERMISSION_IDS.map((permissionId) => ({ roleId, permissionId }))),
]

export function roleLabel(role?: string) {
  return ROLE_LABELS[(role || 'staff') as Role] || role || 'Staff'
}

export function normalizeRole(role?: string): Role {
  if (role === 'staff') return 'operations_officer'
  if (role && role in ROLE_LABELS) return role as Role
  return 'operations_officer'
}

export function isSuperUserRole(role?: string) {
  return role === SUPERUSER_ROLE
}

export function isStaffPortalRole(role?: string) {
  return Boolean(role) && !isSuperUserRole(role)
}

export function isActiveStatus(status?: StaffStatus, active?: boolean) {
  if (status) return status === 'ACTIVE'
  return active !== false
}

export function statusLabel(status?: StaffStatus) {
  return (status || 'ACTIVE')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
