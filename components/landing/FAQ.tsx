'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'What types of PDFs does DataPulse AI support?',
    answer:
      'DataPulse AI is optimized for structured B2B documents: analyst reports, market research, whitepapers, case studies, financial filings, and internal strategy papers. It handles text-native PDFs and scanned documents with embedded OCR layers. Password-protected files are not currently supported.',
  },
  {
    question: 'How does source-tracing work? Will it hallucinate stats?',
    answer:
      'Every statistic, quote, or claim in the output links back to the exact page and paragraph from your original PDF. Our extraction pipeline never generates facts — it only surfaces and reformats what is present in your document. This means zero hallucinated statistics, which is critical for regulated industries like finance, healthcare, and legal.',
  },
  {
    question: 'Which platforms does DataPulse publish to?',
    answer:
      'The Starter plan covers LinkedIn and Twitter / X. Professional and Business plans add email newsletter formatting optimized for platforms like Mailchimp, HubSpot, and Beehiiv. Direct publishing integrations (OAuth-linked accounts) are on the roadmap for Q3 2026. Currently, all output is copy-paste or downloadable.',
  },
  {
    question: 'How accurate is the trilingual output?',
    answer:
      'Very. We use domain-specific translation models fine-tuned on B2B marketing and financial content rather than generic consumer translation engines. French and Spanish outputs are reviewed against terminology standards used in those markets. Native speaker feedback from our beta cohort rated them 4.7/5 for natural fluency.',
  },
  {
    question: 'What happens when I hit my monthly PDF limit?',
    answer:
      'Your dashboard shows real-time credit usage. When you reach your plan\'s limit, you can purchase a one-time Credit Pack (no plan change required), upgrade your subscription, or wait for your credits to reset on your billing anniversary date. We never auto-charge for overages.',
  },
  {
    question: 'Is my data private? Who can see my uploaded PDFs?',
    answer:
      'Your PDFs are processed in isolated, single-tenant jobs. Files are encrypted at rest and in transit. No document content is used to train our models. Enterprise and Business customers can request a Data Processing Agreement (DPA) and region-specific storage (EU/US). Files are permanently deleted 90 days after upload unless you remove them sooner.',
  },
  {
    question: 'Can multiple team members share one account?',
    answer:
      'Yes. Starter plans support 1 seat. Professional plans support up to 3 seats with role-based permissions. Business plans allow up to 10 seats plus a dedicated approval workflow so editors can review content before it leaves the platform. Additional seats beyond plan limits can be added at $15 / seat / month.',
  },
  {
    question: 'Do you offer a free trial or a refund policy?',
    answer:
      'The Free plan gives you 2 full PDF conversions with no credit card required — enough to see the quality first-hand. Paid plans come with a 7-day money-back guarantee, no questions asked. If you upgrade mid-cycle, we prorate the difference automatically.',
  },
];

function FAQItem({ item, index }: { item: (typeof faqs)[0]; index: number }) {
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
          {item.question}
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
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
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
          {faqs.map((item, i) => (
            <FAQItem key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export { FAQ };
