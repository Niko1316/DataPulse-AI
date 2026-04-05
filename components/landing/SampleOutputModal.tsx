'use client'

import { useState } from 'react'
import { X, Briefcase, MessageCircle, Image, BarChart3 } from 'lucide-react'

const sampleLinkedIn = `🔍 Our latest industry report reveals a counterintuitive truth:

Companies spending LESS on customer acquisition are growing 2.3x faster than their high-spend competitors.

Here's why:

The top 15% of B2B companies have shifted from "spray and pray" to what we call "Precision Authority Marketing":

→ They publish 73% fewer pieces of content
→ But each piece generates 4.1x more qualified leads
→ Their cost per MQL dropped by 58% in 12 months

The secret? They start with data, not opinions.

Every post is backed by original research. Every claim is traceable to a source. Every insight challenges conventional wisdom.

This is exactly what DataPulse AI automates — turning your reports into source-traced authority content.

📊 Full report link in comments.

#B2BMarketing #ContentStrategy #ThoughtLeadership`

const sampleTwitterThread = `🧵 Thread: 5 findings from our SaaS Benchmark Report that will change how you think about churn

1/ The #1 predictor of churn isn't product usage — it's TIME TO FIRST VALUE.

Companies with a TTFV under 48 hours see 67% lower churn at month 6.

2/ "Power users" churn MORE than casual users in Year 2.

Why? They hit the ceiling of your product faster. If you can't expand with them, they leave for enterprise solutions.

3/ Price increases DON'T cause churn spikes — if done right.

Companies that raised prices 15-20% with 60 days notice saw only 2.1% incremental churn. The key: framing it as "investment in the platform."

4/ The best retention lever isn't your product. It's your CONTENT.

B2B SaaS companies that publish weekly thought leadership have 31% higher NRR. Your content IS your product moat.

5/ AI-native companies are rewriting the playbook entirely.

They process customer data 4x faster and personalize retention campaigns at scale. This is the future.

Full report: [link]`

const sampleCarousel = [
  { slide: 1, title: 'The State of B2B Content 2026', body: 'Key findings from 2,847 companies across 14 industries' },
  { slide: 2, title: '73% fewer posts', body: 'Top performers publish less but generate 4.1x more leads per piece' },
  { slide: 3, title: 'Cost per MQL down 58%', body: 'Precision beats volume — every time' },
  { slide: 4, title: 'Source-traced content wins', body: '89% of B2B buyers trust content backed by original data' },
  { slide: 5, title: 'The AI advantage', body: 'AI-powered content teams produce 3.2x more output with higher quality' },
  { slide: 6, title: 'Get your report analyzed', body: 'Upload any PDF → Get a full content pack in 60 seconds → datapulse.ai' },
]

const tabs = [
  { id: 'linkedin', label: 'LinkedIn', icon: Briefcase },
  { id: 'twitter', label: 'X / Twitter', icon: MessageCircle },
  { id: 'carousel', label: 'Instagram', icon: Image },
  { id: 'infographic', label: 'Infographic', icon: BarChart3 },
]

export function SampleOutputModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('linkedin')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} />
      <div
        className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl border overflow-hidden flex flex-col"
        style={{ background: '#0a0a0a', borderColor: '#222' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#222' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#e5e5e5' }}>Sample Output</h2>
            <p className="text-xs mt-0.5" style={{ color: '#666' }}>Generated from &quot;B2B SaaS Benchmark Report 2026&quot;</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-[#1a1a1a]">
            <X className="w-5 h-5" style={{ color: '#666' }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: activeTab === tab.id ? 'rgba(0,212,255,0.1)' : 'transparent',
                color: activeTab === tab.id ? '#00d4ff' : '#666',
              }}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'linkedin' && (
            <div className="rounded-xl border p-5" style={{ background: '#141414', borderColor: '#222' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', color: 'white' }}>
                  DP
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#e5e5e5' }}>Your Brand</p>
                  <p className="text-[10px]" style={{ color: '#666' }}>LinkedIn Post</p>
                </div>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(0,119,181,0.1)', color: '#0077b5' }}>LinkedIn</span>
              </div>
              <pre className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#a0a0a0', fontFamily: 'inherit' }}>{sampleLinkedIn}</pre>
            </div>
          )}

          {activeTab === 'twitter' && (
            <div className="rounded-xl border p-5" style={{ background: '#141414', borderColor: '#222' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', color: 'white' }}>
                  DP
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#e5e5e5' }}>Your Brand</p>
                  <p className="text-[10px]" style={{ color: '#666' }}>X Thread (5 posts)</p>
                </div>
              </div>
              <pre className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#a0a0a0', fontFamily: 'inherit' }}>{sampleTwitterThread}</pre>
            </div>
          )}

          {activeTab === 'carousel' && (
            <div className="space-y-3">
              {sampleCarousel.map(slide => (
                <div key={slide.slide} className="rounded-xl border p-4 flex items-start gap-4" style={{ background: '#141414', borderColor: '#222' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold" style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', color: 'white' }}>
                    {slide.slide}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#e5e5e5' }}>{slide.title}</p>
                    <p className="text-xs mt-1" style={{ color: '#a0a0a0' }}>{slide.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'infographic' && (
            <div className="rounded-xl border p-5" style={{ background: '#141414', borderColor: '#222' }}>
              <h3 className="text-base font-bold mb-4 gradient-text">B2B Content Performance Index 2026</h3>
              <div className="space-y-3">
                {[
                  { label: 'Content pieces reduced', value: '73%', bar: 73 },
                  { label: 'Lead generation increase', value: '4.1x', bar: 82 },
                  { label: 'Cost per MQL reduction', value: '58%', bar: 58 },
                  { label: 'Buyer trust in sourced content', value: '89%', bar: 89 },
                  { label: 'AI team output multiplier', value: '3.2x', bar: 64 },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#a0a0a0' }}>{item.label}</span>
                      <span className="font-bold" style={{ color: '#00d4ff' }}>{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
                      <div className="h-full rounded-full" style={{ width: `${item.bar}%`, background: 'linear-gradient(90deg, #00d4ff, #7b2ff7)' }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] mt-4 text-center" style={{ color: '#666' }}>Source: DataPulse AI Analysis — B2B SaaS Benchmark Report 2026</p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 border-t" style={{ borderColor: '#222' }}>
          <a
            href="/signup"
            className="block w-full text-center py-3 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', color: 'white' }}
          >
            Generate your own content pack — Free
          </a>
        </div>
      </div>
    </div>
  )
}
