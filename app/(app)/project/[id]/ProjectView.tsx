'use client'

import { useState } from 'react'
import {
  Copy, Check, Edit3, ChevronDown, ChevronUp, BarChart3, Lightbulb,
  BookOpen, ExternalLink, FileSpreadsheet, FileJson, MessageCircle,
  Heart, Share2, Repeat2, Eye, Briefcase, Image, LayoutGrid, X
} from 'lucide-react'

interface Insight {
  summary: string
  key_themes: string[]
  extracted_statistics: Array<{ stat: string; context: string; page_ref: string }>
  counter_intuitive_insights: Array<{ insight: string; why_surprising: string; source: string }>
  suggested_angles: string[]
}

interface Asset {
  id: string
  platform: string
  language: string
  content_type: string
  content_text: string
  content_json: Record<string, unknown>
  visual_brief?: string
}

interface Project {
  id: string
  name: string
  status: string
  platforms: string[]
  languages: string[]
}

const PLATFORM_CONFIG: Record<string, { label: string; icon: typeof Briefcase; color: string; bg: string }> = {
  linkedin: { label: 'LinkedIn', icon: Briefcase, color: '#0077B5', bg: 'rgba(0,119,181,0.08)' },
  twitter: { label: 'X / Twitter', icon: MessageCircle, color: '#e5e5e5', bg: 'rgba(255,255,255,0.04)' },
  instagram: { label: 'Instagram', icon: Image, color: '#E4405F', bg: 'rgba(228,64,95,0.06)' },
  infographic: { label: 'Infographic', icon: BarChart3, color: '#00d4ff', bg: 'rgba(0,212,255,0.06)' },
}

const LANG_FLAGS: Record<string, string> = { en: '🇬🇧', fr: '🇫🇷', es: '🇪🇸' }

// --- LinkedIn Post Card ---
function LinkedInCard({ asset, index }: { asset: Asset; index: number }) {
  const [text, setText] = useState(asset.content_text)
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  const json = asset.content_json as { hook?: string; visual_brief?: string }

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #e0e0e0' }}>
      {/* LinkedIn header bar */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #e8e8e8' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #0077B5, #00a0dc)', color: 'white' }}>
            DP
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#000' }}>DataPulse AI</p>
            <p className="text-xs" style={{ color: '#666' }}>Generated Post #{index + 1} &middot; 1d</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: '#E7F3FF', color: '#0077B5' }}>
          LinkedIn
        </span>
      </div>

      {/* Hook highlight */}
      {json.hook && (
        <div className="px-4 pt-3">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#0077B5' }}>Hook</p>
          <p className="text-sm font-semibold" style={{ color: '#333' }}>{json.hook}</p>
        </div>
      )}

      {/* Post body */}
      <div className="px-4 py-3">
        {editing ? (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full p-3 rounded-lg border text-sm resize-none outline-none min-h-[180px]"
            style={{ background: '#f8f9fa', borderColor: '#ddd', color: '#333' }}
          />
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#333' }}>{text}</p>
        )}
      </div>

      {/* Engagement mock */}
      <div className="px-4 py-2 flex items-center gap-4" style={{ borderTop: '1px solid #e8e8e8' }}>
        <span className="flex items-center gap-1 text-xs" style={{ color: '#666' }}>
          <Heart className="w-3.5 h-3.5" style={{ color: '#0077B5' }} /> Like
        </span>
        <span className="flex items-center gap-1 text-xs" style={{ color: '#666' }}>
          <MessageCircle className="w-3.5 h-3.5" /> Comment
        </span>
        <span className="flex items-center gap-1 text-xs" style={{ color: '#666' }}>
          <Repeat2 className="w-3.5 h-3.5" /> Repost
        </span>
        <span className="flex items-center gap-1 text-xs" style={{ color: '#666' }}>
          <Share2 className="w-3.5 h-3.5" /> Send
        </span>
      </div>

      {/* Visual brief */}
      {json.visual_brief && (
        <div className="px-4 py-2" style={{ background: '#f0f7ff', borderTop: '1px solid #e0e8f0' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#0077B5' }}>Visual Brief</p>
          <p className="text-xs" style={{ color: '#555' }}>{json.visual_brief}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#141414', borderTop: '1px solid #222' }}>
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: copied ? 'rgba(0,200,83,0.1)' : 'rgba(0,119,181,0.1)', color: copied ? '#00c853' : '#0077B5', border: `1px solid ${copied ? 'rgba(0,200,83,0.2)' : 'rgba(0,119,181,0.2)'}` }}>
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: editing ? 'rgba(123,47,247,0.1)' : 'rgba(255,255,255,0.05)', color: editing ? '#7b2ff7' : '#666', border: `1px solid ${editing ? 'rgba(123,47,247,0.2)' : '#333'}` }}>
          <Edit3 className="w-3 h-3" /> {editing ? 'Done' : 'Edit'}
        </button>
      </div>
    </div>
  )
}

// --- Twitter/X Card ---
function TwitterCard({ asset, index }: { asset: Asset; index: number }) {
  const [text, setText] = useState(asset.content_text)
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Split into thread tweets
  const tweets = text.split(/\n{2,}/).filter(Boolean)

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#15202B', border: '1px solid #38444D' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #38444D' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', color: '#0a0a0a' }}>
            DP
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#e7e9ea' }}>DataPulse AI <span className="text-xs font-normal" style={{ color: '#71767B' }}>@datapulseai</span></p>
            <p className="text-xs" style={{ color: '#71767B' }}>Thread #{index + 1}</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#e7e9ea' }}>
          X
        </span>
      </div>

      {editing ? (
        <div className="p-4">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            className="w-full p-3 rounded-lg border text-sm resize-none outline-none min-h-[180px]"
            style={{ background: '#192734', borderColor: '#38444D', color: '#e7e9ea' }}
          />
        </div>
      ) : (
        <div className="divide-y divide-[#38444D]">
          {tweets.map((tweet, i) => (
            <div key={i} className="px-4 py-3 flex gap-3">
              {tweets.length > 1 && (
                <div className="flex flex-col items-center">
                  <div className="w-0.5 flex-1" style={{ background: i === 0 ? 'transparent' : '#38444D' }} />
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{ background: 'rgba(0,212,255,0.15)', color: '#00d4ff' }}>
                    {i + 1}
                  </span>
                  <div className="w-0.5 flex-1" style={{ background: i === tweets.length - 1 ? 'transparent' : '#38444D' }} />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm leading-relaxed" style={{ color: '#e7e9ea' }}>{tweet.trim()}</p>
                <div className="flex gap-6 mt-2">
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#71767B' }}>
                    <MessageCircle className="w-3 h-3" /> {Math.floor(Math.random() * 50 + 5)}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#71767B' }}>
                    <Repeat2 className="w-3 h-3" /> {Math.floor(Math.random() * 200 + 20)}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#71767B' }}>
                    <Heart className="w-3 h-3" /> {Math.floor(Math.random() * 500 + 50)}
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#71767B' }}>
                    <Eye className="w-3 h-3" /> {(Math.random() * 50 + 5).toFixed(1)}K
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#0D1117', borderTop: '1px solid #38444D' }}>
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: copied ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.06)', color: copied ? '#00c853' : '#e7e9ea', border: `1px solid ${copied ? 'rgba(0,200,83,0.2)' : '#38444D'}` }}>
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy Thread'}
        </button>
        <button onClick={() => setEditing(!editing)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: editing ? 'rgba(123,47,247,0.1)' : 'rgba(255,255,255,0.06)', color: editing ? '#7b2ff7' : '#71767B', border: `1px solid ${editing ? 'rgba(123,47,247,0.2)' : '#38444D'}` }}>
          <Edit3 className="w-3 h-3" /> {editing ? 'Done' : 'Edit'}
        </button>
      </div>
    </div>
  )
}

// --- Instagram Carousel Card ---
function InstagramCard({ asset }: { asset: Asset }) {
  const [copied, setCopied] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  const json = asset.content_json as { slides?: Array<{ slide_number: number; title: Record<string, string>; body: Record<string, string> }> }
  const slides = json?.slides || []

  async function handleCopy() {
    const text = slides.map((s, i) => `[Slide ${i + 1}] ${s.title?.en || ''}\n${s.body?.en || ''}`).join('\n\n')
    await navigator.clipboard.writeText(text || asset.content_text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid transparent', background: 'linear-gradient(#141414, #141414) padding-box, linear-gradient(135deg, #833AB4, #FD1D1D, #F77737) border-box' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full p-[2px]" style={{ background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)' }}>
            <div className="w-full h-full rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: '#141414', color: '#e5e5e5' }}>DP</div>
          </div>
          <p className="text-sm font-semibold" style={{ color: '#e5e5e5' }}>datapulseai</p>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded" style={{ background: 'rgba(228,64,95,0.1)', color: '#E4405F' }}>Carousel</span>
      </div>

      {/* Slide viewer */}
      {slides.length > 0 ? (
        <div>
          <div className="relative aspect-square max-h-[360px] flex items-center justify-center p-8"
            style={{ background: `linear-gradient(135deg, ${activeSlide % 2 === 0 ? 'rgba(0,212,255,0.06)' : 'rgba(123,47,247,0.06)'}, #0f0f0f)` }}>
            <div className="text-center max-w-sm">
              <span className="inline-block text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full mb-4"
                style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>
                SLIDE {activeSlide + 1} / {slides.length}
              </span>
              <h3 className="text-lg font-black mb-3" style={{ color: '#e5e5e5' }}>
                {slides[activeSlide]?.title?.en || slides[activeSlide]?.title?.fr || `Slide ${activeSlide + 1}`}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#a0a0a0' }}>
                {slides[activeSlide]?.body?.en || slides[activeSlide]?.body?.fr || ''}
              </p>
            </div>

            {/* Nav arrows */}
            {activeSlide > 0 && (
              <button onClick={() => setActiveSlide(activeSlide - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.6)', color: '#e5e5e5' }}>
                &lsaquo;
              </button>
            )}
            {activeSlide < slides.length - 1 && (
              <button onClick={() => setActiveSlide(activeSlide + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.6)', color: '#e5e5e5' }}>
                &rsaquo;
              </button>
            )}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 py-3">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setActiveSlide(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{ background: i === activeSlide ? '#E4405F' : '#333', transform: i === activeSlide ? 'scale(1.3)' : 'scale(1)' }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-6">
          <p className="text-sm whitespace-pre-wrap" style={{ color: '#a0a0a0' }}>{asset.content_text}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: '1px solid #222' }}>
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: copied ? 'rgba(0,200,83,0.1)' : 'rgba(228,64,95,0.08)', color: copied ? '#00c853' : '#E4405F', border: `1px solid ${copied ? 'rgba(0,200,83,0.2)' : 'rgba(228,64,95,0.2)'}` }}>
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy All Slides'}
        </button>
      </div>
    </div>
  )
}

// --- Infographic Card ---
function InfographicCard({ asset }: { asset: Asset }) {
  const [copied, setCopied] = useState(false)

  const json = asset.content_json as {
    title?: Record<string, string>
    data_points?: Array<{ label: Record<string, string>; value: string }>
    footer?: string
  }

  async function handleCopy() {
    const text = [
      json?.title?.en || 'Infographic',
      '',
      ...(json?.data_points || []).map(dp => `${dp.label?.en || ''}: ${dp.value}`),
      '',
      json?.footer || '',
    ].join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0f0f0f', border: '1px solid #222' }}>
      {/* Header */}
      <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(123,47,247,0.06))' }}>
        <span className="inline-block text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full mb-3"
          style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>
          INFOGRAPHIC
        </span>
        <h3 className="text-xl font-black" style={{ color: '#e5e5e5' }}>
          {json?.title?.en || json?.title?.fr || 'Data Visualization'}
        </h3>
      </div>

      {/* Data points as bars */}
      {json?.data_points && json.data_points.length > 0 && (
        <div className="px-6 py-5 space-y-4">
          {json.data_points.map((dp, i) => {
            const numericValue = parseFloat(dp.value.replace(/[^0-9.]/g, ''))
            const maxValue = Math.max(...json.data_points!.map(d => parseFloat(d.value.replace(/[^0-9.]/g, '')) || 0))
            const percentage = maxValue > 0 ? (numericValue / maxValue) * 100 : 60

            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium" style={{ color: '#a0a0a0' }}>{dp.label?.en || dp.label?.fr || ''}</p>
                  <p className="text-sm font-black" style={{ color: '#e5e5e5' }}>{dp.value}</p>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      background: i % 2 === 0
                        ? 'linear-gradient(90deg, #00d4ff, #00a8cc)'
                        : 'linear-gradient(90deg, #7b2ff7, #a855f7)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer */}
      {json?.footer && (
        <div className="px-6 py-3" style={{ background: '#0a0a0a', borderTop: '1px solid #1a1a1a' }}>
          <p className="text-xs text-center" style={{ color: '#555' }}>{json.footer}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: '1px solid #222' }}>
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: copied ? 'rgba(0,200,83,0.1)' : 'rgba(0,212,255,0.08)', color: copied ? '#00c853' : '#00d4ff', border: `1px solid ${copied ? 'rgba(0,200,83,0.2)' : 'rgba(0,212,255,0.2)'}` }}>
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy Data'}
        </button>
      </div>
    </div>
  )
}

// --- Main ProjectView ---
export function ProjectView({ project, insights, assets }: { project: Project; insights: Insight | null; assets: Asset[] }) {
  const [activePlatform, setActivePlatform] = useState(project.platforms?.[0] || 'linkedin')
  const [activeLanguage, setActiveLanguage] = useState(project.languages?.[0] || 'en')
  const [insightsOpen, setInsightsOpen] = useState(true)
  const [copiedAll, setCopiedAll] = useState(false)

  const filteredAssets = assets.filter(a => a.platform === activePlatform && a.language === activeLanguage)
  const availablePlatforms = Object.keys(PLATFORM_CONFIG).filter(p => assets.some(a => a.platform === p))
  const availableLanguages = [...new Set(assets.map(a => a.language))]

  async function copyAll() {
    const text = filteredAssets.map(a => a.content_text).join('\n\n---\n\n')
    await navigator.clipboard.writeText(text)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  function exportCSV() {
    const header = 'Platform,Language,Type,Content\n'
    const rows = assets.map(a =>
      `"${a.platform}","${a.language}","${a.content_type}","${a.content_text.replace(/"/g, '""')}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name || 'datapulse'}-export.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportJSON() {
    const data = {
      project: { id: project.id, name: project.name },
      insights,
      assets: assets.map(a => ({ platform: a.platform, language: a.language, type: a.content_type, content: a.content_text, json: a.content_json })),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name || 'datapulse'}-export.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#e5e5e5' }}>{project.name}</h1>
          <p className="text-sm mt-1" style={{ color: '#666' }}>
            {assets.length} content pieces &middot; {availablePlatforms.length} platforms &middot; {availableLanguages.length} language{availableLanguages.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: project.status === 'completed' ? 'rgba(0,200,83,0.1)' : 'rgba(0,212,255,0.1)', color: project.status === 'completed' ? '#00c853' : '#00d4ff', border: `1px solid ${project.status === 'completed' ? 'rgba(0,200,83,0.2)' : 'rgba(0,212,255,0.2)'}` }}>
            {project.status === 'completed' ? 'Completed' : project.status}
          </span>
        </div>
      </div>

      {/* Document Insights (collapsible) */}
      {insights && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#141414', borderColor: '#222' }}>
          <button
            onClick={() => setInsightsOpen(!insightsOpen)}
            className="w-full flex items-center justify-between p-5 text-left"
          >
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: '#e5e5e5' }}>
              <Lightbulb className="w-5 h-5" style={{ color: '#00d4ff' }} /> Document Insights
            </h2>
            {insightsOpen ? <ChevronUp className="w-4 h-4" style={{ color: '#666' }} /> : <ChevronDown className="w-4 h-4" style={{ color: '#666' }} />}
          </button>

          {insightsOpen && (
            <div className="px-5 pb-5 space-y-5">
              {/* Summary */}
              <p className="text-sm leading-relaxed" style={{ color: '#a0a0a0' }}>{insights.summary}</p>

              {/* Key Themes */}
              {insights.key_themes?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#666' }}>Key Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {insights.key_themes.map((theme, i) => (
                      <span key={i} className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background: i % 2 === 0 ? 'rgba(0,212,255,0.08)' : 'rgba(123,47,247,0.08)', color: i % 2 === 0 ? '#00d4ff' : '#7b2ff7', border: `1px solid ${i % 2 === 0 ? 'rgba(0,212,255,0.2)' : 'rgba(123,47,247,0.2)'}` }}>
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Counter-intuitive insights */}
              {insights.counter_intuitive_insights?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: '#666' }}>
                    <BarChart3 className="w-3 h-3" /> Counter-Intuitive Findings
                  </p>
                  <div className="grid gap-2">
                    {insights.counter_intuitive_insights.map((ci, i) => (
                      <div key={i} className="rounded-xl p-3" style={{ background: '#0f0f0f', border: '1px solid #1a1a1a' }}>
                        <p className="text-sm font-semibold" style={{ color: '#e5e5e5' }}>{ci.insight}</p>
                        <p className="text-xs mt-1" style={{ color: '#666' }}>{ci.why_surprising}</p>
                        <p className="text-[10px] mt-1 font-medium" style={{ color: '#00d4ff' }}>Source: {ci.source}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistics */}
              {insights.extracted_statistics?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: '#666' }}>
                    <BookOpen className="w-3 h-3" /> Key Statistics
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {insights.extracted_statistics.map((stat, i) => (
                      <div key={i} className="rounded-xl p-3" style={{ background: '#0f0f0f', border: '1px solid #1a1a1a' }}>
                        <p className="text-sm font-black" style={{ color: '#e5e5e5' }}>{stat.stat}</p>
                        <p className="text-xs mt-1" style={{ color: '#666' }}>{stat.context}</p>
                        <p className="text-[10px] mt-1" style={{ color: '#00d4ff' }}>p. {stat.page_ref}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Platform Tabs + Language Switcher */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#111' }}>
          {availablePlatforms.map(p => {
            const cfg = PLATFORM_CONFIG[p]
            const isActive = activePlatform === p
            return (
              <button
                key={p}
                onClick={() => setActivePlatform(p)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: isActive ? cfg.bg : 'transparent',
                  color: isActive ? cfg.color : '#555',
                  border: isActive ? `1px solid ${cfg.color}33` : '1px solid transparent',
                }}
              >
                <cfg.icon className="w-3.5 h-3.5" />
                {cfg.label}
              </button>
            )
          })}
        </div>

        <div className="flex gap-1">
          {availableLanguages.map(lang => (
            <button
              key={lang}
              onClick={() => setActiveLanguage(lang)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all"
              style={{
                background: activeLanguage === lang ? 'rgba(123,47,247,0.1)' : 'transparent',
                color: activeLanguage === lang ? '#7b2ff7' : '#555',
                border: activeLanguage === lang ? '1px solid rgba(123,47,247,0.2)' : '1px solid transparent',
              }}
            >
              {LANG_FLAGS[lang] || ''} {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Content Cards */}
      <div className="space-y-5">
        {filteredAssets.length > 0 ? (
          filteredAssets.map((asset, i) => {
            if (activePlatform === 'linkedin') return <LinkedInCard key={asset.id} asset={asset} index={i} />
            if (activePlatform === 'twitter') return <TwitterCard key={asset.id} asset={asset} index={i} />
            if (activePlatform === 'instagram') return <InstagramCard key={asset.id} asset={asset} />
            if (activePlatform === 'infographic') return <InfographicCard key={asset.id} asset={asset} />
            return null
          })
        ) : (
          <div className="text-center py-16 rounded-2xl" style={{ background: '#111', border: '1px solid #1a1a1a' }}>
            <LayoutGrid className="w-8 h-8 mx-auto mb-3" style={{ color: '#333' }} />
            <p className="text-sm" style={{ color: '#555' }}>No content for this platform/language combination</p>
          </div>
        )}
      </div>

      {/* Export Section */}
      {assets.length > 0 && (
        <div className="rounded-2xl border p-5" style={{ background: '#141414', borderColor: '#222' }}>
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#e5e5e5' }}>
            <ExternalLink className="w-4 h-4" style={{ color: '#00d4ff' }} /> Export Content
          </h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={copyAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: copiedAll ? 'rgba(0,200,83,0.1)' : '#1a1a1a', color: copiedAll ? '#00c853' : '#a0a0a0', border: `1px solid ${copiedAll ? 'rgba(0,200,83,0.2)' : '#333'}` }}>
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedAll ? 'Copied All!' : 'Copy All'}
            </button>
            <button onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: '#1a1a1a', color: '#a0a0a0', border: '1px solid #333' }}>
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button onClick={exportJSON}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: '#1a1a1a', color: '#a0a0a0', border: '1px solid #333' }}>
              <FileJson className="w-3.5 h-3.5" /> Export JSON
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
