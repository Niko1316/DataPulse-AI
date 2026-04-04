'use client';

import { useEffect, useRef, useState } from 'react';
import { FileSearch, Link2, Layers, BarChart3, Globe2, UserCheck } from 'lucide-react';

const features = [
  {
    icon: FileSearch,
    title: 'Report-Native Intelligence',
    description:
      'Trained to understand the structure of analyst reports, whitepapers, and research PDFs — not just generic documents. It knows charts from disclaimers.',
    accentColor: '#00d4ff',
  },
  {
    icon: Link2,
    title: 'Source-Traced Claims',
    description:
      'Every stat and assertion links back to its exact page and paragraph. Zero hallucinations. Full credibility for regulated industries and savvy audiences.',
    accentColor: '#7b2ff7',
  },
  {
    icon: Layers,
    title: 'One Upload, Full Campaign',
    description:
      'A single PDF generates a LinkedIn carousel, Twitter thread, email newsletter, and a blog summary — all in one click, all ready to publish.',
    accentColor: '#00d4ff',
  },
  {
    icon: BarChart3,
    title: 'Analyst-Grade Extraction',
    description:
      'Automatically surfaces the top 5 data points, key trends, and strategic implications — the same synthesis a senior analyst would spend hours creating.',
    accentColor: '#7b2ff7',
  },
  {
    icon: Globe2,
    title: 'Trilingual by Default',
    description:
      'Every piece of content is instantly available in English, French, and Spanish. Reach international markets without a localization team or added cost.',
    accentColor: '#00d4ff',
  },
  {
    icon: UserCheck,
    title: 'Human-in-the-Loop',
    description:
      'AI drafts, you approve. Built-in review workflow lets your team edit, comment, and sign off before anything goes live — maintaining brand voice always.',
    accentColor: '#7b2ff7',
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
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

  const Icon = feature.icon;

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
            ? `linear-gradient(135deg, ${feature.accentColor}20, ${feature.accentColor}10)`
            : 'rgba(255,255,255,0.04)',
          border: `1px solid ${hovered ? feature.accentColor + '40' : '#222'}`,
        }}
      >
        <Icon
          size={22}
          strokeWidth={1.5}
          style={{ color: hovered ? feature.accentColor : '#a0a0a0', transition: 'color 0.3s' }}
        />
      </div>

      {/* Text */}
      <h3 className="text-base font-bold mb-2 transition-colors duration-300" style={{ color: '#e5e5e5' }}>
        {feature.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: '#a0a0a0' }}>
        {feature.description}
      </p>
    </div>
  );
}

export default function Features() {
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
            Platform Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#e5e5e5' }}>
            Built for B2B content teams who move fast
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#a0a0a0' }}>
            Every feature was designed with one goal: turning your firm's intellectual capital into
            published authority content with minimal friction.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { Features };
