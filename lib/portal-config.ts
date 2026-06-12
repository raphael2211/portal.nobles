export const KPI_VALUE = 500
export const MONTHLY_TARGET = 100
export const DAILY_MAX = 45
export const CYCLE_DAYS = 30

export const rewardSettings = {
  kpiValue: KPI_VALUE,
  monthlyTarget: MONTHLY_TARGET,
  dailyMax: DAILY_MAX,
  cycleDays: CYCLE_DAYS,
}

export function progressPercent(current: number, target = MONTHLY_TARGET) {
  if (target <= 0) return 0
  return Math.min(100, Math.max(0, (current / target) * 100))
}

export function kpiRewardValue(points: number) {
  return Number((points * KPI_VALUE).toFixed(2))
}

export function clampDailyKpi(points: number) {
  return Math.min(DAILY_MAX, Math.max(0, Math.round(points)))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value)
}
