import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PLANS, getPlanFromPriceId } from '@/lib/stripe/plans'
import { ProjectCard } from '@/components/app/ProjectCard'
import { UsageBar } from '@/components/app/UsageBar'
import { PlanBadge } from '@/components/app/PlanBadge'
import { Plus, TrendingUp, Globe, LayoutGrid } from 'lucide-react'

export const metadata = { title: 'Dashboard — DataPulse AI' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user.id).single()

  // Get subscription / plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('price_id, status')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .order('created', { ascending: false })
    .limit(1)
    .single()

  const planId = subscription?.price_id ? getPlanFromPriceId(subscription.price_id) : 'free'
  const plan = PLANS[planId]

  // Get monthly usage
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: usageCount } = await supabase
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('action_type', 'pdf_processed')
    .gte('created_at', startOfMonth.toISOString())

  const used = usageCount || 0

  // Recent projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Stats
  const { count: totalAssets } = await supabase
    .from('generated_assets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <PlanBadge plan={planId} />
            {subscription?.status === 'trialing' && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>
                Trial Active
              </span>
            )}
          </div>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', color: 'white' }}
        >
          <Plus className="w-4 h-4" /> Upload New Document
        </Link>
      </div>

      {/* Usage */}
      <div className="rounded-xl border p-5" style={{ background: '#141414', borderColor: '#222' }}>
        <UsageBar used={used} limit={plan.limits.pdfsPerMonth} label="PDFs processed this month" />
        {used / plan.limits.pdfsPerMonth > 0.7 && planId !== 'business' && (
          <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(123,47,247,0.05)', border: '1px solid rgba(123,47,247,0.2)' }}>
            <p className="text-sm" style={{ color: '#a0a0a0' }}>
              Running low on PDFs?{' '}
              <Link href="/pricing" style={{ color: '#7b2ff7' }} className="font-medium hover:underline">Upgrade your plan</Link>
              {' '}or{' '}
              <Link href="/billing" style={{ color: '#7b2ff7' }} className="font-medium hover:underline">buy credit packs</Link>
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4" style={{ background: '#141414', borderColor: '#222' }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#00d4ff' }} />
            <span className="text-xs" style={{ color: '#666' }}>Posts Generated</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>{totalAssets || 0}</p>
        </div>
        <div className="rounded-xl border p-4" style={{ background: '#141414', borderColor: '#222' }}>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4" style={{ color: '#7b2ff7' }} />
            <span className="text-xs" style={{ color: '#666' }}>Languages</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>{plan.limits.languages}</p>
        </div>
        <div className="rounded-xl border p-4" style={{ background: '#141414', borderColor: '#222' }}>
          <div className="flex items-center gap-2 mb-2">
            <LayoutGrid className="w-4 h-4" style={{ color: '#00c853' }} />
            <span className="text-xs" style={{ color: '#666' }}>Platforms</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>{plan.limits.platforms}</p>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: '#e5e5e5' }}>Recent Projects</h2>
          <Link href="/history" className="text-sm hover:underline" style={{ color: '#00d4ff' }}>View all</Link>
        </div>
        {projects && projects.length > 0 ? (
          <div className="grid gap-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl border" style={{ background: '#141414', borderColor: '#222' }}>
            <p style={{ color: '#666' }}>No projects yet.</p>
            <Link href="/upload" className="text-sm mt-2 inline-block hover:underline" style={{ color: '#00d4ff' }}>
              Upload your first document
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
