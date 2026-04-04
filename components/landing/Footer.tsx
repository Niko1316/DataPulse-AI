'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, AtSign, Globe2, Mail, Zap } from 'lucide-react';

const NAV_COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'Pricing', href: '/#pricing' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Status', href: 'https://status.datapulse.ai' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/gdpr' },
      { label: 'Data Processing', href: '/dpa' },
    ],
  },
];

const SOCIAL_LINKS = [
  { Icon: AtSign, label: 'Twitter / X', href: 'https://twitter.com/datapulseai' },
  { Icon: Globe2, label: 'LinkedIn', href: 'https://linkedin.com/company/datapulseai' },
  { Icon: ExternalLink, label: 'GitHub', href: 'https://github.com/datapulseai' },
  { Icon: Mail, label: 'Email', href: 'mailto:hello@datapulse.ai' },
];

const LANGUAGES = [
  { code: 'EN', label: 'English' },
  { code: 'FR', label: 'Français' },
  { code: 'ES', label: 'Español' },
];

export default function Footer() {
  const [activeLang, setActiveLang] = useState('EN');

  return (
    <footer
      className="relative border-t"
      style={{ background: '#0a0a0a', borderColor: '#222' }}
    >
      {/* Top glow line */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px opacity-40"
        style={{ background: 'linear-gradient(90deg, transparent, #00d4ff, #7b2ff7, transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Top section: logo + nav columns */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
                }}
              >
                <Zap size={16} style={{ color: '#0a0a0a' }} strokeWidth={2.5} />
              </div>
              <span className="text-lg font-black" style={{ color: '#e5e5e5' }}>
                DataPulse{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  AI
                </span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed mb-6" style={{ color: '#a0a0a0' }}>
              Turn B2B research PDFs into authority content across LinkedIn, Twitter, and email — in
              three languages, in under 60 seconds.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid #222',
                    color: '#a0a0a0',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = 'rgba(0,212,255,0.4)';
                    el.style.color = '#00d4ff';
                    el.style.background = 'rgba(0,212,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = '#222';
                    el.style.color = '#a0a0a0';
                    el.style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLUMNS.map((col) => (
            <div key={col.heading}>
              <p
                className="text-xs font-mono font-bold tracking-widest uppercase mb-4"
                style={{ color: '#e5e5e5' }}
              >
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: '#a0a0a0' }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = '#e5e5e5')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = '#a0a0a0')
                      }
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px mb-8" style={{ background: '#1a1a1a' }} />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-xs order-2 sm:order-1" style={{ color: '#a0a0a0' }}>
            &copy; {new Date().getFullYear()} DataPulse AI, Inc. All rights reserved.
          </p>

          {/* Language switcher */}
          <div className="flex items-center gap-1 order-1 sm:order-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                title={lang.label}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                style={
                  activeLang === lang.code
                    ? {
                        background: 'rgba(0,212,255,0.1)',
                        border: '1px solid rgba(0,212,255,0.3)',
                        color: '#00d4ff',
                      }
                    : {
                        background: 'transparent',
                        border: '1px solid transparent',
                        color: '#a0a0a0',
                      }
                }
                onMouseEnter={(e) => {
                  if (activeLang !== lang.code) {
                    (e.currentTarget as HTMLButtonElement).style.color = '#e5e5e5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeLang !== lang.code) {
                    (e.currentTarget as HTMLButtonElement).style.color = '#a0a0a0';
                  }
                }}
              >
                {lang.code}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
