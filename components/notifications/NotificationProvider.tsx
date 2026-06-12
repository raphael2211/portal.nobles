'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export type Notification = {
  id: string
  title: string
  message?: string
  type?: NotificationType
  read?: boolean
  createdAt: string
}

type NotificationContextType = {
  notifications: Notification[]
  addNotification: (n: { title: string; message?: string; type?: NotificationType }) => void
  markRead: (id: string) => void
  remove: (id: string) => void
  clear: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      if (typeof window === 'undefined') return []
      const raw = localStorage.getItem('nobles_notifications')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('nobles_notifications', JSON.stringify(notifications))
    } catch {}
  }, [notifications])

  const addNotification = ({ title, message, type = 'info' }: { title: string; message?: string; type?: NotificationType }) => {
    const n: Notification = { id: String(Date.now()), title, message, type, read: false, createdAt: new Date().toISOString() }
    setNotifications(prev => [n, ...prev])
    if (type === 'success') {
      setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== n.id)), 4000)
    }
  }

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const remove = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id))
  const clear = () => setNotifications([])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markRead, remove, clear }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
