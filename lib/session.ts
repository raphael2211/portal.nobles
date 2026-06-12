import { cookies } from 'next/headers'
import { portalStore } from './portal-store'
import { verifyToken } from './auth'

export function currentSession() {
  const token = cookies().get('nobles_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export function currentUser() {
  const session = currentSession()
  if (!session) return null
  return portalStore.getUser(session.userId)
}

export function requireAdmin() {
  const session = currentSession()
  if (!session || session.role !== 'superuser') return null
  return session
}
