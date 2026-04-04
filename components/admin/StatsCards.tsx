import { Activity, Users, CreditCard, AlertTriangle, Clock, TrendingUp } from 'lucide-react'

interface Stat {
  label: string
  value: string | number
  icon: 'activity' | 'users' | 'credit' | 'alert' | 'clock' | 'trending'
  color: string
}

const icons = {
  activity: Activity,
  users: Users,
  credit: CreditCard,
  alert: AlertTriangle,
  clock: Clock,
  trending: TrendingUp,
}

export function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, i) => {
        const Icon = icons[stat.icon]
        return (
          <div key={i} className="rounded-xl border p-4" style={{ background: '#141414', borderColor: '#222' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color: stat.color }} />
              <span className="text-xs" style={{ color: '#666' }}>{stat.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>{stat.value}</p>
          </div>
        )
      })}
    </div>
  )
}
