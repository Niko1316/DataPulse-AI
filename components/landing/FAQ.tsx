'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';

const FAQ_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: '#141414',
        border: `1px solid ${open ? 'rgba(0,212,255,0.3)' : '#222'}`,
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-inset"
        aria-expanded={open}
      >
        <span className="font-semibold text-sm sm:text-base pr-2" style={{ color: '#e5e5e5' }}>
          {question}
        </span>
        <span
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200"
          style={{
            background: open ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${open ? 'rgba(0,212,255,0.3)' : '#333'}`,
          }}
        >
          {open ? (
            <Minus size={14} style={{ color: '#00d4ff' }} />
          ) : (
            <Plus size={14} style={{ color: '#a0a0a0' }} />
          )}
        </span>
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: open ? '400px' : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        <p
          className="px-6 pb-5 text-sm leading-relaxed"
          style={{ color: '#a0a0a0' }}
        >
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const t = useTranslations('faq');

  return (
    <section className="py-24 relative" style={{ background: '#0a0a0a' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p
            className="text-xs font-mono font-bold tracking-widest uppercase mb-4"
            style={{ color: '#00d4ff' }}
          >
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#e5e5e5' }}>
            Everything you need to know
          </h2>
          <p className="text-lg" style={{ color: '#a0a0a0' }}>
            Not covered here?{' '}
            <a
              href="mailto:hello@datapulse.ai"
              className="transition-colors duration-200"
              style={{ color: '#00d4ff' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#7b2ff7')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#00d4ff')}
            >
              Email us directly.
            </a>
          </p>
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-3">
          {FAQ_KEYS.map((key) => (
            <FAQItem
              key={key}
              question={t(`q${key}`)}
              answer={t(`a${key}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export { FAQ };
