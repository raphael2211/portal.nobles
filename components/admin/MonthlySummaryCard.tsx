'use client'

import React from 'react'
import { Trophy } from 'lucide-react'
import type { SummaryMetrics } from '../../types/portal'
import { SummaryCard } from './DailySummaryCard'

export default function MonthlySummaryCard({ summary }: { summary: SummaryMetrics }) {
  return <SummaryCard title="Monthly summary" summary={summary} icon={<Trophy className="h-5 w-5" />} />
}
