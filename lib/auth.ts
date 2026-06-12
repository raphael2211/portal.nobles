import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import type { Role } from '../types/portal'

const JWT_SECRET = process.env.JWT_SECRET || 'changeme'

export type SessionPayload = {
  userId: number
  role: Role
  exp: number
}

function base64Url(input: string) {
  return Buffer.from(input).toString('base64url')
}

function sign(value: string) {
  return createHmac('sha256', JWT_SECRET).update(value).digest('base64url')
}

export function signToken(payload: { userId: number; role: Role }, days = 7) {
  const session: SessionPayload = {
    ...payload,
    exp: Date.now() + days * 24 * 60 * 60 * 1000,
  }
  const encoded = base64Url(JSON.stringify(session))
  return `${encoded}.${sign(encoded)}`
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const [encoded, signature] = token.split('.')
    if (!encoded || !signature) return null
    const expected = sign(encoded)
    const left = Buffer.from(signature)
    const right = Buffer.from(expected)
    if (left.length !== right.length || !timingSafeEqual(left, right)) return null
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as SessionPayload
    if (!payload.exp || payload.exp < Date.now()) return null
    return payload
  } catch (err) {
    return null
  }
}

export function setTokenCookie(res: NextResponse, token: string) {
  res.cookies.set('nobles_token', token, { httpOnly: true, path: '/', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 })
}

export function clearTokenCookie(res: NextResponse) {
  res.cookies.set('nobles_token', '', { httpOnly: true, path: '/', maxAge: 0 })
}
