import { Quote } from 'lucide-react';

const testimonials = [
  {
    initials: 'AL',
    name: 'Amara Lindqvist',
    title: 'Head of Content Strategy',
    company: 'Verikal Intelligence',
    quote:
      "We publish three research reports a quarter. Before DataPulse, each one took two weeks of repurposing work. Now we upload the PDF on launch day and LinkedIn, email, and our newsletter go out the same afternoon. The source-tracing alone eliminated a full QA cycle.",
    gradient: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
  },
  {
    initials: 'RM',
    name: 'Renaud Moreau',
    title: 'VP Marketing',
    company: 'Axeltis Capital',
    quote:
      "Our compliance team was skeptical — financial content requires precision. But the cited-claim feature with page references actually made them more confident in our social output than our old manual process. We went from 4 posts a month to 20, with zero compliance flags.",
    gradient: 'linear-gradient(135deg, #7b2ff7, #00d4ff)',
  },
  {
    initials: 'DP',
    name: 'Diana Pacheco',
    title: 'Director of Demand Generation',
    company: 'Structura SaaS',
    quote:
      "The trilingual output is what sold me. We serve North America and Europe and were paying a localization agency $3k a month. DataPulse replaced that entirely. The French and Spanish posts don't feel translated — they read like they were written natively.",
    gradient: 'linear-gradient(135deg, #00d4ff, #7b2ff7)',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 relative" style={{ background: '#0a0a0a' }}>
      {/* Top divider glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 opacity-30"
        style={{ background: 'linear-gradient(180deg, transparent, #7b2ff7)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="text-xs font-mono font-bold tracking-widest uppercase mb-4"
            style={{ color: '#7b2ff7' }}
          >
            Customer Stories
          </p>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#e5e5e5' }}>
            Trusted by B2B teams who publish for real
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#a0a0a0' }}>
            500+ marketers, content strategists, and demand gen leaders use DataPulse AI every week.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="relative rounded-2xl p-6 flex flex-col"
              style={{
                background: '#141414',
                border: '1px solid #222',
              }}
            >
              {/* Quote icon */}
              <Quote
                size={24}
                className="mb-4 shrink-0"
                style={{ color: i % 2 === 0 ? '#00d4ff' : '#7b2ff7', opacity: 0.6 }}
              />

              {/* Quote text */}
              <p
                className="text-sm leading-relaxed flex-1 mb-6"
                style={{ color: '#a0a0a0' }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Divider */}
              <div
                className="h-px mb-5"
                style={{ background: '#222' }}
              />

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{
                    background: t.gradient,
                    color: '#0a0a0a',
                  }}
                >
                  {t.initials}
                </div>

                <div>
                  <p className="text-sm font-bold leading-tight" style={{ color: '#e5e5e5' }}>
                    {t.name}
                  </p>
                  <p className="text-xs leading-tight" style={{ color: '#a0a0a0' }}>
                    {t.title} &middot;{' '}
                    <span style={{ color: i % 2 === 0 ? '#00d4ff' : '#7b2ff7' }}>
                      {t.company}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof bar */}
        <div
          className="mt-14 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          style={{ background: '#141414', border: '1px solid #222' }}
        >
          {[
            { value: '500+', label: 'B2B marketers' },
            { value: '12,000+', label: 'PDFs processed' },
            { value: '3 languages', label: 'supported natively' },
            { value: '< 60s', label: 'average turnaround' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl sm:text-3xl font-black mb-1" style={{ color: '#e5e5e5' }}>
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: '#a0a0a0' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Testimonials };
