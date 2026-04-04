'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Brain, Share2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload Your Report',
    description:
      'Drag and drop any PDF — analyst research, whitepapers, internal studies, or market reports up to 50MB. We support multi-file batch uploads too.',
  },
  {
    number: '02',
    icon: Brain,
    title: 'AI Analyzes & Extracts',
    description:
      'Our engine reads every page, identifies key statistics, traces claims to their source, and structures the data into high-impact content frameworks.',
  },
  {
    number: '03',
    icon: Share2,
    title: 'Distribute Everywhere',
    description:
      'Publish polished LinkedIn posts, Twitter threads, and email newsletters simultaneously — in up to three languages — directly from your dashboard.',
  },
];

function StepCard({
  step,
  index,
  isLast,
}: {
  step: (typeof steps)[0];
  index: number;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Icon = step.icon;

  return (
    <div className="relative flex flex-col items-center" ref={ref}>
      {/* Connector line (except last) */}
      {!isLast && (
        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-12 left-[calc(50%+3.5rem)] w-[calc(100%-7rem)] h-px z-0"
          style={{
            background: 'linear-gradient(90deg, #00d4ff 0%, #7b2ff7 100%)',
            opacity: visible ? 0.5 : 0,
            transition: `opacity 0.8s ease ${index * 0.25 + 0.4}s`,
          }}
        >
          {/* Arrow head */}
          <span
            className="absolute right-0 -top-[5px] border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px]"
            style={{ borderLeftColor: '#7b2ff7', opacity: 0.8 }}
          />
        </div>
      )}

      {/* Icon circle */}
      <div
        className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-700"
        style={{
          background: '#141414',
          border: `2px solid ${visible ? '#00d4ff' : '#222'}`,
          boxShadow: visible ? '0 0 32px rgba(0,212,255,0.2)' : 'none',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.9)',
          transitionDelay: `${index * 0.2}s`,
        }}
      >
        <Icon size={36} style={{ color: '#00d4ff' }} strokeWidth={1.5} />
        <span
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
          style={{
            background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
            color: '#0a0a0a',
          }}
        >
          {index + 1}
        </span>
      </div>

      {/* Text */}
      <div
        className="text-center max-w-xs transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transitionDelay: `${index * 0.2 + 0.1}s`,
        }}
      >
        <p
          className="text-xs font-mono font-bold tracking-widest mb-2"
          style={{ color: '#7b2ff7' }}
        >
          STEP {step.number}
        </p>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#e5e5e5' }}>
          {step.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: '#a0a0a0' }}>
          {step.description}
        </p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="py-24 relative" style={{ background: '#0a0a0a' }}>
      {/* Section divider glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 opacity-40"
        style={{ background: 'linear-gradient(180deg, transparent, #00d4ff)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <p
            className="text-xs font-mono font-bold tracking-widest uppercase mb-4"
            style={{ color: '#00d4ff' }}
          >
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#e5e5e5' }}>
            Three steps from PDF to pipeline
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#a0a0a0' }}>
            No templates. No manual editing. Just upload and watch your content strategy build itself.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} isLast={i === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { HowItWorks };
