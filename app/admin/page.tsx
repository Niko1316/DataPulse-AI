import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Briefcase,
  CalendarCheck,
  Users,
  UserCheck,
  Activity,
  Database,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dashboard')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const [
    { count: totalJobs },
    { count: jobsToday },
    { count: activeSubscribers },
    { count: totalClients },
    { count: totalLogs },
    { count: sdrPending },
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('system_logs').select('*', { count: 'exact', head: true }),
    supabase.from('sdr_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    {
      label: 'Total Jobs',
      value: totalJobs ?? 0,
      icon: Briefcase,
      accent: '#00d4ff',
      bg: 'rgba(0,212,255,0.08)',
    },
    {
      label: 'Jobs Today',
      value: jobsToday ?? 0,
      icon: CalendarCheck,
      accent: '#00c853',
      bg: 'rgba(0,200,83,0.08)',
    },
    {
      label: 'Active Subscribers',
      value: activeSubscribers ?? 0,
      icon: UserCheck,
      accent: '#7b2ff7',
      bg: 'rgba(123,47,247,0.08)',
    },
    {
      label: 'Total Clients',
      value: totalClients ?? 0,
      icon: Users,
      accent: '#00d4ff',
      bg: 'rgba(0,212,255,0.08)',
    },
    {
      label: 'System Logs',
      value: totalLogs ?? 0,
      icon: Database,
      accent: '#ff9800',
      bg: 'rgba(255,152,0,0.08)',
    },
    {
      label: 'SDR Pending',
      value: sdrPending ?? 0,
      icon: Activity,
      accent: '#ff3d3d',
      bg: 'rgba(255,61,61,0.08)',
    },
  ]

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#e5e5e5', marginBottom: '8px' }}>
        Overview
      </h1>
      <p style={{ color: '#a0a0a0', marginBottom: '32px', fontSize: '14px' }}>
        Platform health at a glance
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
      }}>
        {stats.map(({ label, value, icon: Icon, accent, bg }) => (
          <div
            key={label}
            style={{
              background: '#141414',
              border: '1px solid #222',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              background: bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={20} color={accent} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#e5e5e5', lineHeight: 1 }}>
                {value.toLocaleString()}
              </div>
              <div style={{ fontSize: '13px', color: '#a0a0a0', marginTop: '6px' }}>
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
