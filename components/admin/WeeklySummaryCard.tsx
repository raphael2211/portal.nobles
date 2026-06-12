'use client'

import React from 'react'
import { BarChart3 } from 'lucide-react'
import type { SummaryMetrics } from '../../types/portal'
import { SummaryCard } from './DailySummaryCard'

export default function WeeklySummaryCard({ summary }: { summary: SummaryMetrics }) {
  return <SummaryCard title="Weekly summary" summary={summary} icon={<BarChart3 className="h-5 w-5" />} />
}
