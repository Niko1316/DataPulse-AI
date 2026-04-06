'use client';

import { useEffect, useRef, useState } from 'react';
import { FileSearch, Link2, Layers, BarChart3, Globe2, UserCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

const featureIcons = [FileSearch, Link2, Layers, BarChart3, Globe2, UserCheck];
const featureAccents = ['#00d4ff', '#7b2ff7', '#00d4ff', '#7b2ff7', '#00d4ff', '#7b2ff7'];

function FeatureCard({
  icon: Icon,
  title,
  description,
  accentColor,
  index,
}: {
  icon: typeof FileSearch;
  title: string;
  description: string;
  accentColor: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-xl p-6 transition-all duration-300 cursor-default"
      style={{
        background: '#141414',
        border: `1px solid ${hovered ? 'transparent' : '#222'}`,
        backgroundImage: hovered
          ? 'linear-gradient(#141414, #141414), linear-gradient(135deg, #00d4ff, #7b2ff7)'
          : 'none',
        backgroundOrigin: 'border-box',
        backgroundClip: hovered ? 'padding-box, border-box' : 'border-box',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.5s ease ${Math.floor(index / 3) * 0.1 + (index % 3) * 0.1}s, transform 0.5s ease ${Math.floor(index / 3) * 0.1 + (index % 3) * 0.1}s, box-shadow 0.3s ease, border-color 0.3s ease`,
      }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300"
        style={{
          background: hovered
            ? `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`
            : 'rgba(255,255,255,0.04)',
          border: `1px solid ${hovered ? accentColor + '40' : '#222'}`,
        }}
      >
        <Icon
          size={22}
          strokeWidth={1.5}
          style={{ color: hovered ? accentColor : '#a0a0a0', transition: 'color 0.3s' }}
        />
      </div>

      {/* Text */}
      <h3 className="text-base font-bold mb-2 transition-colors duration-300" style={{ color: '#e5e5e5' }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: '#a0a0a0' }}>
        {description}
      </p>
    </div>
  );
}

export default function Features() {
  const t = useTranslations('features');

  const features = [
    { icon: featureIcons[0], title: t('item1Title'), description: t('item1Desc'), accentColor: featureAccents[0] },
    { icon: featureIcons[1], title: t('item2Title'), description: t('item2Desc'), accentColor: featureAccents[1] },
    { icon: featureIcons[2], title: t('item3Title'), description: t('item3Desc'), accentColor: featureAccents[2] },
    { icon: featureIcons[3], title: t('item4Title'), description: t('item4Desc'), accentColor: featureAccents[3] },
    { icon: featureIcons[4], title: t('item5Title'), description: t('item5Desc'), accentColor: featureAccents[4] },
    { icon: featureIcons[5], title: t('item6Title'), description: t('item6Desc'), accentColor: featureAccents[5] },
  ];

  return (
    <section className="py-24 relative" style={{ background: '#0a0a0a' }}>
      {/* Subtle grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#00d4ff 1px, transparent 1px), linear-gradient(90deg, #00d4ff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="text-xs font-mono font-bold tracking-widest uppercase mb-4"
            style={{ color: '#7b2ff7' }}
          >
            {t('sectionLabel')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#e5e5e5' }}>
            {t('title')}
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#a0a0a0' }}>
            {t('subtitle')}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <FeatureCard
              key={i}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              accentColor={feature.accentColor}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export { Features };
