'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function KPITrendChart({ data }: { data: { date: string; kpi: number }[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.16} vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="kpi" stroke="#0B1F3A" strokeWidth={3} dot={{ r: 3, fill: '#C8A96B' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
