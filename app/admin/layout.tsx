'use client'

import React, { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/navigation'
import Sidebar from '../../components/shared/Sidebar'
import Navbar from '../../components/shared/Navbar'
import { motion } from 'framer-motion'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (user === null) router.push('/login')
    else if (user && user.role !== 'superuser') router.push('/staff/dashboard')
  }, [loading, user, router])

  if (loading || !user) return <div className="grid min-h-screen place-items-center text-sm font-medium text-slate-500">Preparing command center...</div>

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="min-h-screen lg:pl-72">
        <Navbar />
        <motion.div 
          className="page-shell" 
          initial={{ opacity: 0, y: 6 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}