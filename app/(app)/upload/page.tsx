'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadZone } from '@/components/app/UploadZone'
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react'

const steps = ['Upload', 'Configure', 'Processing', 'Results']

const objectives = [
  { value: 'thought_leadership', label: 'Thought Leadership' },
  { value: 'lead_generation', label: 'Lead Generation' },
  { value: 'report_promotion', label: 'Report Promotion' },
  { value: 'brand_awareness', label: 'Brand Awareness' },
]

const audiences = [
  { value: 'executives', label: 'Executives' },
  { value: 'operators', label: 'Operators' },
  { value: 'marketers', label: 'Marketers' },
  { value: 'investors', label: 'Investors' },
  { value: 'general_professional', label: 'General Professional' },
]

const tones = [
  { value: 'analytical', label: 'Analytical' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'bold', label: 'Bold' },
  { value: 'corporate', label: 'Corporate' },
]

const platformOptions = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'infographic', label: 'Infographic' },
]

const processingMessages = [
  'Extracting document structure...',
  'Identifying key insights...',
  'Generating content pack...',
  'Finalizing your authority pack...',
]

export default function UploadPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [projectId, setProjectId] = useState('')
  const [processingMsg, setProcessingMsg] = useState(0)

  // Config state
  const [objective, setObjective] = useState('thought_leadership')
  const [audience, setAudience] = useState('general_professional')
  const [tone, setTone] = useState('analytical')
  const [platforms, setPlatforms] = useState(['linkedin'])
  const [languages, setLanguages] = useState(['en'])
  const [cta, setCta] = useState('')
  const [brandName, setBrandName] = useState('')

  function toggleArray(arr: string[], value: string, setter: (v: string[]) => void) {
    setter(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value])
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileSize: file.size, contentType: 'application/pdf' }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }

      const { projectId: pid, uploadUrl } = await res.json()
      setProjectId(pid)

      // Upload file to Supabase Storage via signed URL
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        body: file,
      })

      setStep(1) // Move to config
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleProcess() {
    setStep(2) // Move to processing

    // Start processing
    await fetch(`/api/projects/${projectId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        languages,
        platforms,
        tone,
        objective,
        targetAudience: audience,
        cta,
        brandName,
      }),
    })

    // Poll for completion
    const msgInterval = setInterval(() => {
      setProcessingMsg(prev => Math.min(prev + 1, processingMessages.length - 1))
    }, 8000)

    const pollInterval = setInterval(async () => {
      const res = await fetch(`/api/projects/${projectId}/status`)
      const data = await res.json()
      if (data.status === 'completed') {
        clearInterval(pollInterval)
        clearInterval(msgInterval)
        router.push(`/project/${projectId}`)
      } else if (data.status === 'failed') {
        clearInterval(pollInterval)
        clearInterval(msgInterval)
        alert('Processing failed. Please try again.')
        setStep(1)
      }
    }, 3000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>Upload Document</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: i < step ? '#00d4ff' : i === step ? 'linear-gradient(135deg, #00d4ff, #7b2ff7)' : '#1a1a1a',
                color: i <= step ? 'white' : '#666',
              }}
            >
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className="text-xs hidden sm:inline" style={{ color: i === step ? '#e5e5e5' : '#666' }}>{s}</span>
            {i < steps.length - 1 && <div className="w-8 h-px" style={{ background: '#222' }} />}
          </div>
        ))}
      </div>

      {/* Step 0: Upload */}
      {step === 0 && (
        <div className="space-y-6">
          <UploadZone maxSizeMB={50} onFileSelect={setFile} uploading={uploading} />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', color: 'white' }}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Upload & Continue
          </button>
        </div>
      )}

      {/* Step 1: Configure */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#a0a0a0' }}>Objective</label>
            <div className="grid grid-cols-2 gap-2">
              {objectives.map(o => (
                <button
                  key={o.value}
                  onClick={() => setObjective(o.value)}
                  className="px-4 py-2.5 rounded-lg border text-sm transition-colors"
                  style={{
                    borderColor: objective === o.value ? '#00d4ff' : '#222',
                    background: objective === o.value ? 'rgba(0,212,255,0.05)' : '#141414',
                    color: objective === o.value ? '#00d4ff' : '#a0a0a0',
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#a0a0a0' }}>Target Audience</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {audiences.map(a => (
                <button
                  key={a.value}
                  onClick={() => setAudience(a.value)}
                  className="px-4 py-2.5 rounded-lg border text-sm transition-colors"
                  style={{
                    borderColor: audience === a.value ? '#00d4ff' : '#222',
                    background: audience === a.value ? 'rgba(0,212,255,0.05)' : '#141414',
                    color: audience === a.value ? '#00d4ff' : '#a0a0a0',
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#a0a0a0' }}>Tone</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tones.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className="px-4 py-2.5 rounded-lg border text-sm transition-colors"
                  style={{
                    borderColor: tone === t.value ? '#00d4ff' : '#222',
                    background: tone === t.value ? 'rgba(0,212,255,0.05)' : '#141414',
                    color: tone === t.value ? '#00d4ff' : '#a0a0a0',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#a0a0a0' }}>Platforms</label>
            <div className="grid grid-cols-2 gap-2">
              {platformOptions.map(p => (
                <button
                  key={p.value}
                  onClick={() => toggleArray(platforms, p.value, setPlatforms)}
                  className="px-4 py-2.5 rounded-lg border text-sm transition-colors"
                  style={{
                    borderColor: platforms.includes(p.value) ? '#7b2ff7' : '#222',
                    background: platforms.includes(p.value) ? 'rgba(123,47,247,0.05)' : '#141414',
                    color: platforms.includes(p.value) ? '#7b2ff7' : '#a0a0a0',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#a0a0a0' }}>Languages</label>
            <div className="flex gap-2">
              {[{ v: 'en', l: 'English' }, { v: 'fr', l: 'Français' }, { v: 'es', l: 'Español' }].map(lang => (
                <button
                  key={lang.v}
                  onClick={() => toggleArray(languages, lang.v, setLanguages)}
                  className="px-4 py-2.5 rounded-lg border text-sm transition-colors"
                  style={{
                    borderColor: languages.includes(lang.v) ? '#7b2ff7' : '#222',
                    background: languages.includes(lang.v) ? 'rgba(123,47,247,0.05)' : '#141414',
                    color: languages.includes(lang.v) ? '#7b2ff7' : '#a0a0a0',
                  }}
                >
                  {lang.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#a0a0a0' }}>CTA (optional)</label>
            <input
              value={cta}
              onChange={e => setCta(e.target.value)}
              placeholder="e.g. Download the full report"
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00d4ff]"
              style={{ background: '#141414', borderColor: '#222', color: '#e5e5e5' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#a0a0a0' }}>Brand Name (optional)</label>
            <input
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              placeholder="Your company name"
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00d4ff]"
              style={{ background: '#141414', borderColor: '#222', color: '#e5e5e5' }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(0)}
              className="px-5 py-2.5 rounded-lg border text-sm font-medium"
              style={{ borderColor: '#222', color: '#a0a0a0' }}
            >
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
            </button>
            <button
              onClick={handleProcess}
              disabled={platforms.length === 0 || languages.length === 0}
              className="flex-1 py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', color: 'white' }}
            >
              Generate Content Pack <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Processing */}
      {step === 2 && (
        <div className="text-center py-16 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center animate-pulse-glow" style={{ background: 'rgba(0,212,255,0.1)' }}>
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#00d4ff' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#e5e5e5' }}>Processing your document</h2>
            <p className="mt-2 text-sm" style={{ color: '#a0a0a0' }}>{processingMessages[processingMsg]}</p>
          </div>
          <div className="w-48 mx-auto h-1.5 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${((processingMsg + 1) / processingMessages.length) * 100}%`,
                background: 'linear-gradient(90deg, #00d4ff, #7b2ff7)',
              }}
            />
          </div>
          <p className="text-xs" style={{ color: '#666' }}>Estimated time: 30-90 seconds</p>
        </div>
      )}
    </div>
  )
}
