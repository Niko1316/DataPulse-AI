'use client';

import { useState } from 'react';
import { Check, X, Zap, Loader2 } from 'lucide-react';
import { PLANS, CREDIT_PACKS } from '@/lib/stripe/plans';
import { useTranslations } from 'next-intl';

const PLAN_ORDER = ['free', 'starter', 'professional', 'business'] as const;

function formatPrice(cents: number): string {
  if (cents === 0) return '$0';
  return `$${(cents / 100).toFixed(0)}`;
}

export default function Pricing() {
  const t = useTranslations('pricing');
  const [yearly, setYearly] = useState(false);
  const [loadingPack, setLoadingPack] = useState<number | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleSubscribe(priceId: string, planId: string) {
    if (!priceId) {
      window.location.href = '/signup?plan=' + planId;
      return;
    }
    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (res.status === 401) {
        window.location.href = '/signup?plan=' + planId;
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleBuyCredits(priceId: string, credits: number) {
    if (!priceId) {
      window.location.href = '/signup';
      return;
    }
    setLoadingPack(credits);
    try {
      const res = await fetch('/api/checkout/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, credits }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (res.status === 401) {
        window.location.href = '/signup';
      } else {
        alert(data.error || 'Something went wrong');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoadingPack(null);
    }
  }

  return (
    <section className="py-24 relative" style={{ background: '#0a0a0a' }}>
      {/* Glow accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(ellipse, #7b2ff7 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="text-xs font-mono font-bold tracking-widest uppercase mb-4"
            style={{ color: '#00d4ff' }}
          >
            {t('sectionLabel')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#e5e5e5' }}>
            {t('heading')}
          </h2>
          <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: '#a0a0a0' }}>
            {t('description')}
          </p>

          {/* Monthly / Yearly toggle */}
          <div className="inline-flex items-center gap-3">
            <span
              className="text-sm font-semibold"
              style={{ color: yearly ? '#a0a0a0' : '#e5e5e5' }}
            >
              {t('monthly')}
            </span>
            <button
              onClick={() => setYearly((v) => !v)}
              className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              style={{
                background: yearly
                  ? 'linear-gradient(135deg, #00d4ff, #7b2ff7)'
                  : '#222',
              }}
              aria-label="Toggle billing period"
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300"
                style={{
                  background: '#e5e5e5',
                  transform: yearly ? 'translateX(24px)' : 'translateX(0)',
                }}
              />
            </button>
            <span
              className="text-sm font-semibold"
              style={{ color: yearly ? '#e5e5e5' : '#a0a0a0' }}
            >
              {t('yearly')}
            </span>
            {yearly && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(0,212,255,0.1)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  color: '#00d4ff',
                }}
              >
                {t('savePct')}
              </span>
            )}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const isPro = planId === 'professional';
            const price = yearly ? plan.price.yearly : plan.price.monthly;

            return (
              <div
                key={planId}
                className="relative rounded-2xl p-6 flex flex-col"
                style={{
                  background: isPro
                    ? 'linear-gradient(160deg, #141414 60%, rgba(123,47,247,0.08) 100%)'
                    : '#141414',
                  border: isPro
                    ? '1px solid rgba(123,47,247,0.6)'
                    : '1px solid #222',
                  boxShadow: isPro ? '0 0 40px rgba(123,47,247,0.15)' : 'none',
                }}
              >
                {/* Most Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="text-xs font-black tracking-widest px-3 py-1 rounded-full whitespace-nowrap"
                      style={{
                        background: 'linear-gradient(135deg, #7b2ff7, #00d4ff)',
                        color: '#0a0a0a',
                      }}
                    >
                      {t('popular')}
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h3
                  className="text-lg font-black mb-1"
                  style={{ color: isPro ? '#7b2ff7' : '#e5e5e5' }}
                >
                  {plan.name.en}
                </h3>

                {/* Price */}
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black" style={{ color: '#e5e5e5' }}>
                    {formatPrice(price)}
                  </span>
                  {price > 0 && (
                    <span className="text-sm mb-1.5" style={{ color: '#a0a0a0' }}>
                      {t('perMo')}
                    </span>
                  )}
                </div>
                {yearly && price > 0 && (
                  <p className="text-xs mb-4" style={{ color: '#a0a0a0' }}>
                    {t('billedAnnually')} ({formatPrice(price * 12)} {t('perYear')})
                  </p>
                )}
                {(!yearly || price === 0) && <div className="mb-4" />}

                {/* Limits summary */}
                <div
                  className="rounded-lg px-3 py-2 mb-5 text-xs space-y-1"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a1a1a' }}
                >
                  <p style={{ color: '#a0a0a0' }}>
                    <span style={{ color: '#e5e5e5', fontWeight: 700 }}>
                      {plan.limits.pdfsPerMonth}
                    </span>{' '}
                    {t('pdfsPerMonth')}
                  </p>
                  <p style={{ color: '#a0a0a0' }}>
                    {t('upTo')}{' '}
                    <span style={{ color: '#e5e5e5', fontWeight: 700 }}>
                      {plan.limits.maxFileSizeMB}MB
                    </span>{' '}
                    {t('perFile')}
                  </p>
                  <p style={{ color: '#a0a0a0' }}>
                    <span style={{ color: '#e5e5e5', fontWeight: 700 }}>
                      {plan.limits.teamMembers}
                    </span>{' '}
                    {plan.limits.teamMembers > 1 ? t('teamMembers') : t('teamMember')}
                  </p>
                </div>

                {/* Feature list */}
                <ul className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check
                        size={14}
                        className="mt-0.5 shrink-0"
                        style={{ color: isPro ? '#7b2ff7' : '#00d4ff' }}
                      />
                      <span style={{ color: '#a0a0a0' }}>
                        {t(`feature_${f}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => {
                    if (planId === 'free') {
                      window.location.href = '/signup';
                    } else {
                      const priceId = yearly ? plan.priceIds.yearly : plan.priceIds.monthly;
                      handleSubscribe(priceId, planId);
                    }
                  }}
                  disabled={loadingPlan === planId}
                  className="block w-full text-center rounded-lg py-2.5 text-sm font-bold transition-all duration-200 disabled:opacity-60"
                  style={
                    isPro
                      ? {
                          background: 'linear-gradient(135deg, #7b2ff7, #00d4ff)',
                          color: '#0a0a0a',
                        }
                      : planId === 'free'
                      ? {
                          background: 'transparent',
                          border: '1px solid #222',
                          color: '#e5e5e5',
                        }
                      : {
                          background: 'rgba(0,212,255,0.1)',
                          border: '1px solid rgba(0,212,255,0.25)',
                          color: '#00d4ff',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isPro) {
                      e.currentTarget.style.opacity = '0.8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {loadingPlan === planId ? (
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  ) : planId === 'free' ? t('getStartedFree') : t('choose') + ' ' + plan.name.en}
                </button>
              </div>
            );
          })}
        </div>

        {/* Credit Packs */}
        <div>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <Zap size={18} style={{ color: '#00d4ff' }} />
              <h3 className="text-xl font-black" style={{ color: '#e5e5e5' }}>
                {t('creditPacksHeading')}
              </h3>
            </div>
            <p className="text-sm" style={{ color: '#a0a0a0' }}>
              {t('creditPacksDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CREDIT_PACKS.map((pack) => (
              <div
                key={pack.credits}
                className="rounded-xl p-5 flex flex-col items-center text-center transition-all duration-200"
                style={{
                  background: '#141414',
                  border: '1px solid #222',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,212,255,0.4)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    '0 4px 24px rgba(0,212,255,0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#222';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <p className="text-xs font-mono font-bold tracking-widest uppercase mb-2" style={{ color: '#00d4ff' }}>
                  {pack.label}
                </p>
                <p className="text-3xl font-black mb-1" style={{ color: '#e5e5e5' }}>
                  {pack.credits}
                  <span className="text-base font-semibold ml-1" style={{ color: '#a0a0a0' }}>
                    {t('credits')}
                  </span>
                </p>
                <p className="text-xl font-bold mb-4" style={{ color: '#e5e5e5' }}>
                  {formatPrice(pack.price)}
                </p>
                <p className="text-xs mb-5" style={{ color: '#a0a0a0' }}>
                  {formatPrice(Math.round(pack.price / pack.credits))} {t('perPdf')}
                </p>
                <button
                  onClick={() => handleBuyCredits(pack.priceId, pack.credits)}
                  disabled={loadingPack === pack.credits}
                  className="w-full text-center rounded-lg py-2 text-sm font-bold transition-all duration-200 disabled:opacity-60"
                  style={{
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.2)',
                    color: '#00d4ff',
                  }}
                >
                  {loadingPack === pack.credits ? (
                    <Loader2 className="w-4 h-4 animate-spin inline" />
                  ) : t('buyPack')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { Pricing };
