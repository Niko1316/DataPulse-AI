import { type PlanId } from '@/lib/stripe/plans'

const planColors: Record<string, { bg: string; text: string }> = {
  free: { bg: 'rgba(102,102,102,0.2)', text: '#666' },
  starter: { bg: 'rgba(0,212,255,0.1)', text: '#00d4ff' },
  professional: { bg: 'rgba(123,47,247,0.1)', text: '#7b2ff7' },
  business: { bg: 'rgba(0,200,83,0.1)', text: '#00c853' },
}

export function PlanBadge({ plan }: { plan: PlanId }) {
  const colors = planColors[plan] || planColors.free
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ background: colors.bg, color: colors.text }}
    >
      {plan}
    </span>
  )
}
