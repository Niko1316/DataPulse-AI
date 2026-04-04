'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PLANS, CREDIT_PACKS, getPlanFromPriceId } from '@/lib/stripe/plans'
import { UsageBar } from '@/components/app/UsageBar'
import { PlanBadge } from '@/components/app/PlanBadge'
import { Loader2, ExternalLink, Zap } from 'lucide-react'

export default function BillingPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [planId, setPlanId] = useState<keyof typeof PLANS>('free')
  const [usage, setUsage] = useState(0)
  const [credits, setCredits] = useState(0)
  const [periodEnd, setPeriodEnd] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .order('created', { ascending: false })
        .limit(1)
        .single()

      if (sub?.price_id) {
        setPlanId(getPlanFromPriceId(sub.price_id))
        if (sub.current_period_end) setPeriodEnd(new Date(sub.current_period_end).toLocaleDateString())
      }

      const { data: creds } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .single()
      if (creds) setCredits(creds.balance)

      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const { count } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('action_type', 'pdf_processed')
        .gte('created_at', startOfMonth.toISOString())
      setUsage(count || 0)

      setLoading(false)
    }
    load()
  }, [supabase])

  async function openPortal() {
    const res = await fetch('/api/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  async function buyCredits(priceId: string, creditCount: number) {
    const res = await fetch('/api/checkout/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, credits: creditCount }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#00d4ff' }} />
      </div>
    )
  }

  const plan = PLANS[planId]

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>Billing</h1>

      {/* Current Plan */}
      <div className="rounded-xl border p-6" style={{ background: '#141414', borderColor: '#222' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: '#e5e5e5' }}>Current Plan</h2>
            <div className="flex items-center gap-2 mt-1">
              <PlanBadge plan={planId} />
              {periodEnd && <span className="text-xs" style={{ color: '#666' }}>Renews {periodEnd}</span>}
            </div>
          </div>
          {planId !== 'free' && (
            <button onClick={openPortal} className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm" style={{ borderColor: '#222', color: '#a0a0a0' }}>
              Manage <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <UsageBar used={usage} limit={plan.limits.pdfsPerMonth} label="PDFs this month" />
      </div>

      {/* Credits */}
      <div className="rounded-xl border p-6" style={{ background: '#141414', borderColor: '#222' }}>
        <h2 className="text-lg font-semibold mb-1" style={{ color: '#e5e5e5' }}>Credits</h2>
        <p className="text-3xl font-bold" style={{ color: '#00d4ff' }}>{credits}</p>
        <p className="text-xs mt-1" style={{ color: '#666' }}>Available credits for additional processing</p>
      </div>

      {/* Credit Packs */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#e5e5e5' }}>
          <Zap className="w-5 h-5" style={{ color: '#7b2ff7' }} /> Add Credits
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {CREDIT_PACKS.map(pack => (
            <button
              key={pack.credits}
              onClick={() => buyCredits(pack.priceId, pack.credits)}
              className="rounded-xl border p-4 text-left transition-colors hover:border-[#333]"
              style={{ background: '#141414', borderColor: '#222' }}
            >
              <p className="text-sm font-medium" style={{ color: '#e5e5e5' }}>{pack.label}</p>
              <p className="text-xs mt-1" style={{ color: '#666' }}>{pack.credits} credits</p>
              <p className="text-lg font-bold mt-2" style={{ color: '#00d4ff' }}>${(pack.price / 100).toFixed(0)}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
