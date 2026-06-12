'use client'

import React from 'react'
import TrainingCard from './TrainingCard'

export default function TrainingList({ items }: { items: { id: string; title: string; desc: string; status: 'pending'|'in-progress'|'completed' }[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map(i => (
        <TrainingCard key={i.id} title={i.title} desc={i.desc} status={i.status} />
      ))}
    </div>
  )
}
