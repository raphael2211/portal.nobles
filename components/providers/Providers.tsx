'use client'

import React from 'react'
import { AuthProvider } from '../../context/AuthContext'
import { NotificationProvider } from '../notifications/NotificationProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </AuthProvider>
  )
}
