'use client';

import Link from 'next/link';
import { ArrowRight, Play, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

const floatingCards = [
  {
    id: 1,
    platform: 'LinkedIn',
    platformColor: '#0077b5',
    avatar: 'SL',
    name: 'Sarah L.',
    title: 'VP Marketing @ Nexify',
    content:
      'Our Q3 market analysis shows a 34% shift toward AI-driven procurement decisions. Here\'s what B2B leaders need to know...',
    likes: '847',
    comments: '92',
    delay: '0s',
    position: 'top-[8%] right-[2%] md:right-[5%]',
  },
  {
    id: 2,
    platform: 'Twitter / X',
    platformColor: '#e5e5e5',
    avatar: 'MK',
    name: 'Marcus K.',
    title: 'CMO @ DataLayer',
    content:
      'Thread: 5 counterintuitive findings from our 2024 SaaS Benchmark Report that will change how you think about churn 🧵',
    likes: '1.2K',
    comments: '214',
    delay: '1.5s',
    position: 'bottom-[12%] right-[2%] md:right-[4%]',
  },
];

export default function Hero() {
  const t = useTranslations()
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: '#0a0a0a' }}
    >
      {/* Glow orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-60 w-[700px] h-[700px] rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #7b2ff7 0%, transparent 70%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(ellipse, #00d4ff 0%, #7b2ff7 50%, transparent 70%)' }}
      />

      {/* Floating preview cards */}
      {floatingCards.map((card) => (
        <div
          key={card.id}
          aria-hidden="true"
          className={`pointer-events-none hidden lg:block absolute ${card.position} w-72 z-10`}
          style={{
            animation: `floatCard 6s ease-in-out infinite`,
            animationDelay: card.delay,
          }}
        >
          <div
            className="rounded-xl p-4 text-sm"
            style={{
              background: '#141414',
              border: '1px solid #222',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
                  color: '#0a0a0a',
                }}
              >
                {card.avatar}
              </div>
              <div>
                <p className="font-semibold text-xs" style={{ color: '#e5e5e5' }}>
                  {card.name}
                </p>
                <p className="text-xs" style={{ color: '#a0a0a0' }}>
                  {card.title}
                </p>
              </div>
              <span
                className="ml-auto text-xs font-semibold px-2 py-0.5 rounded"
                style={{ color: card.platformColor, background: 'rgba(255,255,255,0.05)' }}
              >
                {card.platform}
              </span>
            </div>
            <p style={{ color: '#a0a0a0' }} className="text-xs leading-relaxed line-clamp-3">
              {card.content}
            </p>
            <div className="flex gap-4 mt-3" style={{ color: '#a0a0a0' }}>
              <span className="text-xs">♥ {card.likes}</span>
              <span className="text-xs">💬 {card.comments}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl">
          {/* Trust badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-sm font-medium"
            style={{
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.2)',
              color: '#00d4ff',
            }}
          >
            <Shield size={14} />
            {t('hero.badge')}
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6"
            style={{ color: '#e5e5e5' }}
          >
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl" style={{ color: '#a0a0a0' }}>
            {t('hero.subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup">
              <Button size="lg" variant="primary" className="w-full sm:w-auto">
                {t('hero.cta')}
                <ArrowRight size={18} />
              </Button>
            </Link>
            <button
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base font-semibold transition-all duration-200"
              style={{
                background: 'transparent',
                border: '1px solid #222',
                color: '#e5e5e5',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7b2ff7';
                e.currentTarget.style.color = '#7b2ff7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#222';
                e.currentTarget.style.color = '#e5e5e5';
              }}
            >
              <Play size={16} />
              {t('hero.cta2')}
            </button>
          </div>

          {/* Social proof micro-text */}
          <p className="mt-8 text-sm" style={{ color: '#a0a0a0' }}>
            No setup required · Cancel anytime ·{' '}
            <span style={{ color: '#00d4ff' }}>2 free PDFs</span> on the house
          </p>
        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-16px) rotate(1deg); }
        }
      `}</style>
    </section>
  );
}

export { Hero };
