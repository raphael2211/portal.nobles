'use client'

import React from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuth } from '../../../context/AuthContext'

const COLORS = ['#0B1F3A', '#C8A96B', '#1F3A2D', '#7A1F2B', '#232323']

export default function AdminKPICharts() {
  const { users, activityLogs } = useAuth()
  const staff = users.filter((user) => user.role === 'staff')
  const barData = staff.map((user) => ({ name: user.fullName.split(' ')[0], kpi: user.kpi }))

  const statusCounts = activityLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(statusCounts).map(([key, value]) => ({ name: key.replace(/_/g, ' '), value }))

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="panel">
        <div className="section-kicker">Analytics</div>
        <h3 className="section-title mt-1">Staff KPI breakdown</h3>
        <div className="mt-5 h-72 w-full">
          <ResponsiveContainer>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.18} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(11,31,58,0.06)' }} />
              <Bar dataKey="kpi" radius={[8, 8, 3, 3]} fill="#0B1F3A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="section-kicker">Operational state</div>
        <h3 className="section-title mt-1">Activity statuses</h3>
        <div className="mt-5 h-72 w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={94} paddingAngle={3}>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
