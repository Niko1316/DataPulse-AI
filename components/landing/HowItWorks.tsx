'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Brain, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

const stepIcons = [Upload, Brain, Share2];
const stepNumbers = ['01', '02', '03'];

function StepCard({
  icon: Icon,
  number,
  title,
  description,
  index,
  isLast,
}: {
  icon: typeof Upload;
  number: string;
  title: string;
  description: string;
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
          STEP {number}
        </p>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#e5e5e5' }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: '#a0a0a0' }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    {
      icon: stepIcons[0],
      number: stepNumbers[0],
      title: t('step1Title'),
      description: t('step1Desc'),
    },
    {
      icon: stepIcons[1],
      number: stepNumbers[1],
      title: t('step2Title'),
      description: t('step2Desc'),
    },
    {
      icon: stepIcons[2],
      number: stepNumbers[2],
      title: t('step3Title'),
      description: t('step3Desc'),
    },
  ];

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
            {t('title')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#e5e5e5' }}>
            {t('heading')}
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#a0a0a0' }}>
            {t('description')}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
          {steps.map((step, i) => (
            <StepCard
              key={step.number}
              icon={step.icon}
              number={step.number}
              title={step.title}
              description={step.description}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export { HowItWorks };
