'use client'

import { useState } from 'react'
import { ContentEditor } from '@/components/app/ContentEditor'
import { ExportPanel } from '@/components/app/ExportPanel'
import { Lightbulb, BarChart3, BookOpen } from 'lucide-react'

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

const platformTabs = ['linkedin', 'twitter', 'instagram', 'infographic']

export function ProjectView({ project, insights, assets }: { project: Project; insights: Insight | null; assets: Asset[] }) {
  const [activePlatform, setActivePlatform] = useState(project.platforms?.[0] || 'linkedin')
  const [activeLanguage, setActiveLanguage] = useState(project.languages?.[0] || 'en')

  const filteredAssets = assets.filter(a => a.platform === activePlatform && a.language === activeLanguage)
  const availablePlatforms = platformTabs.filter(p => assets.some(a => a.platform === p))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>{project.name}</h1>
        <p className="text-sm mt-1" style={{ color: '#666' }}>
          {assets.length} content pieces generated
        </p>
      </div>

      {/* Insights summary */}
      {insights && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#e5e5e5' }}>
            <Lightbulb className="w-5 h-5" style={{ color: '#00d4ff' }} /> Document Insights
          </h2>
          <div className="rounded-xl border p-5" style={{ background: '#141414', borderColor: '#222' }}>
            <p className="text-sm leading-relaxed" style={{ color: '#a0a0a0' }}>{insights.summary}</p>
          </div>

          {insights.counter_intuitive_insights?.length > 0 && (
            <div className="grid gap-3">
              <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: '#a0a0a0' }}>
                <BarChart3 className="w-4 h-4" /> Counter-Intuitive Insights
              </h3>
              {insights.counter_intuitive_insights.map((ci, i) => (
                <div key={i} className="rounded-lg border p-4" style={{ background: '#141414', borderColor: '#222' }}>
                  <p className="text-sm font-medium" style={{ color: '#e5e5e5' }}>{ci.insight}</p>
                  <p className="text-xs mt-1" style={{ color: '#666' }}>Why surprising: {ci.why_surprising}</p>
                  <p className="text-xs mt-1" style={{ color: '#00d4ff' }}>Source: {ci.source}</p>
                </div>
              ))}
            </div>
          )}

          {insights.extracted_statistics?.length > 0 && (
            <div>
              <h3 className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: '#a0a0a0' }}>
                <BookOpen className="w-4 h-4" /> Key Statistics
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {insights.extracted_statistics.map((stat, i) => (
                  <div key={i} className="rounded-lg border p-3" style={{ background: '#141414', borderColor: '#222' }}>
                    <p className="text-sm font-bold" style={{ color: '#e5e5e5' }}>{stat.stat}</p>
                    <p className="text-xs mt-1" style={{ color: '#666' }}>{stat.context}</p>
                    <p className="text-[10px] mt-1" style={{ color: '#00d4ff' }}>Page {stat.page_ref}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Platform tabs */}
      <div>
        <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: '#222' }}>
          {availablePlatforms.map(p => (
            <button
              key={p}
              onClick={() => setActivePlatform(p)}
              className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors"
              style={{
                background: activePlatform === p ? 'rgba(0,212,255,0.1)' : 'transparent',
                color: activePlatform === p ? '#00d4ff' : '#666',
              }}
            >
              {p}
            </button>
          ))}

          <div className="ml-auto flex gap-1">
            {(project.languages || ['en']).map(lang => (
              <button
                key={lang}
                onClick={() => setActiveLanguage(lang)}
                className="px-3 py-1.5 rounded text-xs font-medium uppercase transition-colors"
                style={{
                  background: activeLanguage === lang ? 'rgba(123,47,247,0.1)' : 'transparent',
                  color: activeLanguage === lang ? '#7b2ff7' : '#666',
                }}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {filteredAssets.length > 0 ? (
            filteredAssets.map(asset => (
              <ContentEditor
                key={asset.id}
                content={asset.content_text}
                platform={asset.platform}
                language={asset.language}
              />
            ))
          ) : (
            <p className="text-center py-8 text-sm" style={{ color: '#666' }}>
              No content for this platform/language combination
            </p>
          )}
        </div>
      </div>

      {/* Export */}
      {assets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#e5e5e5' }}>Export</h2>
          <ExportPanel assets={assets} />
        </div>
      )}
    </div>
  )
}
