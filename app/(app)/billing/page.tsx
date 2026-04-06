'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PLANS, CREDIT_PACKS, getPlanFromPriceId, type PlanId } from '@/lib/stripe/plans'
import { UsageBar } from '@/components/app/UsageBar'
import { PlanBadge } from '@/components/app/PlanBadge'
import { Loader2, ExternalLink, Zap, Check, ArrowUpRight, CreditCard, Shield, Globe, LayoutGrid, Users } from 'lucide-react'

const PLAN_ORDER: PlanId[] = ['free', 'starter', 'professional', 'business']

function formatPrice(cents: number) {
  return cents === 0 ? '$0' : `$${(cents / 100).toFixed(0)}`
}

export default function BillingPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [planId, setPlanId] = useState<PlanId>('free')
  const [usage, setUsage] = useState(0)
  const [credits, setCredits] = useState(0)
  const [periodEnd, setPeriodEnd] = useState('')
  const [yearly, setYearly] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null)

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
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else if (data.error) alert(data.error)
  }

  async function handleUpgrade(priceId: string, targetPlan: string) {
    if (!priceId) return
    setLoadingCheckout(targetPlan)
    try {
      const res = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Failed to start checkout')
    } catch {
      alert('Something went wrong')
    } finally {
      setLoadingCheckout(null)
    }
  }

  async function handleBuyCredits(priceId: string, creditCount: number) {
    if (!priceId) return
    setLoadingCheckout(`credits-${creditCount}`)
    try {
      const res = await fetch('/api/checkout/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, credits: creditCount }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Failed to start checkout')
    } catch {
      alert('Something went wrong')
    } finally {
      setLoadingCheckout(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#00d4ff' }} />
      </div>
    )
  }

  const plan = PLANS[planId]
  const currentPlanIndex = PLAN_ORDER.indexOf(planId)

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>Billing & Subscription</h1>

      {/* Current Plan Overview */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: '#141414', borderColor: '#222' }}>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5" style={{ color: '#00d4ff' }} />
                <h2 className="text-lg font-bold" style={{ color: '#e5e5e5' }}>Current Plan</h2>
              </div>
              <div className="flex items-center gap-3">
                <PlanBadge plan={planId} />
                <span className="text-2xl font-black" style={{ color: '#e5e5e5' }}>
                  {formatPrice(plan.price.monthly)}
                  {plan.price.monthly > 0 && <span className="text-sm font-normal" style={{ color: '#666' }}>/mo</span>}
                </span>
                {periodEnd && (
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#1a1a1a', color: '#666' }}>
                    Renews {periodEnd}
                  </span>
                )}
              </div>
            </div>
            {planId !== 'free' && (
              <button
                onClick={openPortal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all hover:border-[#444]"
                style={{ borderColor: '#333', color: '#e5e5e5', background: '#1a1a1a' }}
              >
                <CreditCard className="w-4 h-4" /> Manage Subscription <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Plan Stats */}
        <div className="border-t grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#222]" style={{ borderColor: '#222' }}>
          <div className="p-4 text-center" style={{ borderColor: '#222' }}>
            <p className="text-xs mb-1" style={{ color: '#666' }}>PDFs/month</p>
            <p className="text-xl font-bold" style={{ color: '#e5e5e5' }}>{plan.limits.pdfsPerMonth}</p>
          </div>
          <div className="p-4 text-center" style={{ borderColor: '#222' }}>
            <p className="text-xs mb-1" style={{ color: '#666' }}>File Limit</p>
            <p className="text-xl font-bold" style={{ color: '#e5e5e5' }}>{plan.limits.maxFileSizeMB} MB</p>
          </div>
          <div className="p-4 text-center" style={{ borderColor: '#222' }}>
            <p className="text-xs mb-1" style={{ color: '#666' }}>Platforms</p>
            <div className="flex items-center justify-center gap-1">
              <LayoutGrid className="w-3.5 h-3.5" style={{ color: '#7b2ff7' }} />
              <p className="text-xl font-bold" style={{ color: '#e5e5e5' }}>{plan.limits.platforms}</p>
            </div>
          </div>
          <div className="p-4 text-center" style={{ borderColor: '#222' }}>
            <p className="text-xs mb-1" style={{ color: '#666' }}>Languages</p>
            <div className="flex items-center justify-center gap-1">
              <Globe className="w-3.5 h-3.5" style={{ color: '#00d4ff' }} />
              <p className="text-xl font-bold" style={{ color: '#e5e5e5' }}>{plan.limits.languages}</p>
            </div>
          </div>
        </div>

        {/* Usage Bar */}
        <div className="border-t p-5" style={{ borderColor: '#222' }}>
          <UsageBar used={usage} limit={plan.limits.pdfsPerMonth} label="PDFs processed this month" />
        </div>
      </div>

      {/* Credits Section */}
      <div className="rounded-2xl border p-6" style={{ background: '#141414', borderColor: '#222' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#e5e5e5' }}>
              <Zap className="w-5 h-5" style={{ color: '#00d4ff' }} /> Credit Balance
            </h2>
            <p className="text-xs mt-1" style={{ color: '#666' }}>Credits are used when your monthly quota is exhausted. They never expire.</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black" style={{ color: '#00d4ff' }}>{credits}</p>
            <p className="text-xs" style={{ color: '#666' }}>available</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CREDIT_PACKS.map(pack => {
            const isLoading = loadingCheckout === `credits-${pack.credits}`
            return (
              <button
                key={pack.credits}
                onClick={() => handleBuyCredits(pack.priceId, pack.credits)}
                disabled={!!loadingCheckout}
                className="group rounded-xl border p-4 text-left transition-all hover:border-[#00d4ff33] disabled:opacity-60"
                style={{ background: '#0f0f0f', borderColor: '#222' }}
              >
                <p className="text-[10px] font-mono font-bold tracking-widest uppercase mb-2" style={{ color: '#00d4ff' }}>
                  {pack.label}
                </p>
                <p className="text-2xl font-black" style={{ color: '#e5e5e5' }}>
                  {pack.credits}
                  <span className="text-xs font-normal ml-1" style={{ color: '#666' }}>PDFs</span>
                </p>
                <p className="text-lg font-bold mt-1" style={{ color: '#e5e5e5' }}>
                  {formatPrice(pack.price)}
                </p>
                <p className="text-[10px] mt-0.5 mb-3" style={{ color: '#666' }}>
                  {formatPrice(Math.round(pack.price / pack.credits))} per PDF
                </p>
                <span
                  className="block w-full text-center py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}
                >
                  {isLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : 'Buy Pack'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Upgrade Plans */}
      {currentPlanIndex < PLAN_ORDER.length - 1 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#e5e5e5' }}>
              <ArrowUpRight className="w-5 h-5" style={{ color: '#7b2ff7' }} /> Upgrade Your Plan
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: yearly ? '#666' : '#e5e5e5' }}>Monthly</span>
              <button
                onClick={() => setYearly(v => !v)}
                className="relative w-10 h-5 rounded-full transition-colors"
                style={{ background: yearly ? 'linear-gradient(135deg, #00d4ff, #7b2ff7)' : '#333' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform"
                  style={{ background: '#e5e5e5', transform: yearly ? 'translateX(20px)' : 'translateX(0)' }}
                />
              </button>
              <span className="text-xs font-medium" style={{ color: yearly ? '#e5e5e5' : '#666' }}>Yearly</span>
              {yearly && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>-20%</span>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLAN_ORDER.slice(currentPlanIndex + 1).map(upgradePlanId => {
              const upgradePlan = PLANS[upgradePlanId]
              const isPro = upgradePlanId === 'professional'
              const price = yearly ? upgradePlan.price.yearly : upgradePlan.price.monthly
              const priceId = yearly ? upgradePlan.priceIds.yearly : upgradePlan.priceIds.monthly
              const isLoading = loadingCheckout === upgradePlanId

              return (
                <div
                  key={upgradePlanId}
                  className="relative rounded-2xl border p-5 flex flex-col"
                  style={{
                    background: isPro ? 'linear-gradient(160deg, #141414 60%, rgba(123,47,247,0.06))' : '#141414',
                    borderColor: isPro ? 'rgba(123,47,247,0.5)' : '#222',
                    boxShadow: isPro ? '0 0 30px rgba(123,47,247,0.1)' : 'none',
                  }}
                >
                  {isPro && (
                    <span className="absolute -top-2.5 left-4 text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #7b2ff7, #00d4ff)', color: '#0a0a0a' }}>
                      RECOMMENDED
                    </span>
                  )}

                  <h3 className="text-base font-bold mb-1" style={{ color: isPro ? '#7b2ff7' : '#e5e5e5' }}>
                    {upgradePlan.name.en}
                  </h3>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-3xl font-black" style={{ color: '#e5e5e5' }}>{formatPrice(price)}</span>
                    <span className="text-xs mb-1.5" style={{ color: '#666' }}>/mo</span>
                  </div>

                  {/* Key differences from current plan */}
                  <div className="space-y-2 mb-5 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#00d4ff' }} />
                      <span style={{ color: '#a0a0a0' }}><b style={{ color: '#e5e5e5' }}>{upgradePlan.limits.pdfsPerMonth}</b> PDFs/month</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#00d4ff' }} />
                      <span style={{ color: '#a0a0a0' }}>Up to <b style={{ color: '#e5e5e5' }}>{upgradePlan.limits.maxFileSizeMB}MB</b> per file</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#00d4ff' }} />
                      <span style={{ color: '#a0a0a0' }}><b style={{ color: '#e5e5e5' }}>{upgradePlan.limits.platforms}</b> platforms</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#00d4ff' }} />
                      <span style={{ color: '#a0a0a0' }}><b style={{ color: '#e5e5e5' }}>{upgradePlan.limits.languages}</b> language{upgradePlan.limits.languages > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="w-3.5 h-3.5 shrink-0" style={{ color: '#00d4ff' }} />
                      <span style={{ color: '#a0a0a0' }}><b style={{ color: '#e5e5e5' }}>{upgradePlan.limits.teamMembers}</b> team member{upgradePlan.limits.teamMembers > 1 ? 's' : ''}</span>
                    </div>
                    {upgradePlan.limits.brandVoices > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#7b2ff7' }} />
                        <span style={{ color: '#a0a0a0' }}><b style={{ color: '#e5e5e5' }}>{upgradePlan.limits.brandVoices}</b> brand voice{upgradePlan.limits.brandVoices > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpgrade(priceId, upgradePlanId)}
                    disabled={!!loadingCheckout}
                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
                    style={isPro ? {
                      background: 'linear-gradient(135deg, #7b2ff7, #00d4ff)',
                      color: '#0a0a0a',
                    } : {
                      background: 'rgba(0,212,255,0.08)',
                      border: '1px solid rgba(0,212,255,0.25)',
                      color: '#00d4ff',
                    }}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : `Upgrade to ${upgradePlan.name.en}`}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Plan includes */}
      <div className="rounded-2xl border p-6" style={{ background: '#141414', borderColor: '#222' }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: '#e5e5e5' }}>Your plan includes</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {plan.features.map(f => {
            const labels: Record<string, string> = {
              pdf_upload: 'PDF Upload & Processing',
              linkedin_only: 'LinkedIn Posts',
              english_only: 'English Content',
              linkedin: 'LinkedIn Posts',
              twitter: 'X / Twitter Threads',
              basic_analytics: 'Basic Analytics',
              all_platforms: 'All Platforms (LinkedIn, X, Instagram)',
              trilingual: 'Trilingual Content (EN / FR / ES)',
              brand_voice: '1 Brand Voice Profile',
              advanced_analytics: 'Advanced Analytics',
              calendar_export: 'Calendar Export',
              api_access: 'API Access',
              bulk_upload: 'Bulk Upload',
              white_label: 'White-label Exports',
              approval_workflow: 'Team Approval Workflow',
              '5_brand_voices': '5 Brand Voice Profiles',
            }
            return (
              <div key={f} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 shrink-0" style={{ color: '#00d4ff' }} />
                <span style={{ color: '#a0a0a0' }}>{labels[f] ?? f}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
