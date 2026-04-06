'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, Upload, X, User, Palette, Globe, Camera } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'brand'>('profile')

  // Profile fields
  const [fullName, setFullName] = useState('')
  const [language, setLanguage] = useState('en')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Brand fields
  const [brandName, setBrandName] = useState('')
  const [brandLogoUrl, setBrandLogoUrl] = useState('')
  const [brandColor, setBrandColor] = useState('#00d4ff')
  const [linkedinHandle, setLinkedinHandle] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [defaultTone, setDefaultTone] = useState('analytical')
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setFullName(data.full_name || '')
        setLanguage(data.preferred_language || 'en')
        setAvatarUrl(data.avatar_url || '')
        setBrandName(data.brand_name || '')
        setBrandLogoUrl(data.brand_logo_url || '')
        setBrandColor(data.brand_color || '#00d4ff')
        setLinkedinHandle(data.linkedin_handle || '')
        setTwitterHandle(data.twitter_handle || '')
        setInstagramHandle(data.instagram_handle || '')
        setWebsiteUrl(data.website_url || '')
        setDefaultTone(data.default_tone || 'analytical')
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  async function uploadImage(file: File, bucket: string, path: string): Promise<string | null> {
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) {
      console.error('Upload error:', error)
      return null
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Avatar must be under 2MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }
    setUploadingAvatar(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ext = file.name.split('.').pop()
    const url = await uploadImage(file, 'avatars', `${user.id}/avatar.${ext}`)
    if (url) setAvatarUrl(url)
    setUploadingAvatar(false)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo must be under 5MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }
    setUploadingLogo(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ext = file.name.split('.').pop()
    const url = await uploadImage(file, 'avatars', `${user.id}/brand-logo.${ext}`)
    if (url) setBrandLogoUrl(url)
    setUploadingLogo(false)
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      full_name: fullName,
      preferred_language: language,
      avatar_url: avatarUrl,
      brand_name: brandName,
      brand_logo_url: brandLogoUrl,
      brand_color: brandColor,
      linkedin_handle: linkedinHandle,
      twitter_handle: twitterHandle,
      instagram_handle: instagramHandle,
      website_url: websiteUrl,
      default_tone: defaultTone,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    // Update locale cookie if language changed
    document.cookie = `locale=${language}; path=/; max-age=31536000; SameSite=Lax`

    setMessage('Settings saved!')
    setTimeout(() => setMessage(''), 3000)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#00d4ff' }} />
      </div>
    )
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'brand' as const, label: 'Brand & Social', icon: Palette },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Logo size={24} />
        <h1 className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#111' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.id ? '#1a1a1a' : 'transparent',
              color: activeTab === tab.id ? '#e5e5e5' : '#666',
              border: activeTab === tab.id ? '1px solid #222' : '1px solid transparent',
            }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Avatar */}
          <div className="rounded-2xl border p-6" style={{ background: '#141414', borderColor: '#222' }}>
            <label className="block text-sm font-medium mb-4" style={{ color: '#a0a0a0' }}>Profile Photo</label>
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ background: '#1a1a1a', border: '2px solid #333' }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8" style={{ color: '#444' }} />
                  )}
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', color: 'white' }}
                >
                  {uploadingAvatar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#e5e5e5' }}>Upload a profile photo</p>
                <p className="text-xs mt-1" style={{ color: '#666' }}>JPG, PNG or WebP. Max 2MB.</p>
                <p className="text-xs" style={{ color: '#666' }}>Used in your generated LinkedIn/X post previews.</p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="rounded-2xl border p-6" style={{ background: '#141414', borderColor: '#222' }}>
            <label className="block text-sm font-medium mb-2" style={{ color: '#a0a0a0' }}>Full Name</label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00d4ff] transition-colors"
              style={{ background: '#0f0f0f', borderColor: '#222', color: '#e5e5e5' }}
              placeholder="Your full name"
            />
            <p className="text-xs mt-2" style={{ color: '#666' }}>Displayed in your generated post previews.</p>
          </div>

          {/* Language */}
          <div className="rounded-2xl border p-6" style={{ background: '#141414', borderColor: '#222' }}>
            <label className="block text-sm font-medium mb-3" style={{ color: '#a0a0a0' }}>
              <Globe className="w-4 h-4 inline mr-2" />Interface Language
            </label>
            <div className="flex gap-2">
              {[{ v: 'en', l: 'English', flag: '🇬🇧' }, { v: 'fr', l: 'Français', flag: '🇫🇷' }, { v: 'es', l: 'Español', flag: '🇪🇸' }].map(lang => (
                <button
                  key={lang.v}
                  onClick={() => setLanguage(lang.v)}
                  className="flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    borderColor: language === lang.v ? '#00d4ff' : '#222',
                    background: language === lang.v ? 'rgba(0,212,255,0.05)' : '#0f0f0f',
                    color: language === lang.v ? '#00d4ff' : '#a0a0a0',
                  }}
                >
                  <span className="text-lg mr-2">{lang.flag}</span>{lang.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Brand & Social Tab */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          {/* Brand Identity */}
          <div className="rounded-2xl border p-6" style={{ background: '#141414', borderColor: '#222' }}>
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: '#e5e5e5' }}>
              <Palette className="w-4 h-4" style={{ color: '#7b2ff7' }} /> Brand Identity
            </h3>

            <div className="space-y-4">
              {/* Brand Logo */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#666' }}>Brand Logo</label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:border-[#333]"
                    style={{ background: '#0f0f0f', border: '2px dashed #222' }}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {brandLogoUrl ? (
                      <img src={brandLogoUrl} alt="Brand logo" className="w-full h-full object-contain p-1" />
                    ) : uploadingLogo ? (
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#444' }} />
                    ) : (
                      <Upload className="w-5 h-5" style={{ color: '#444' }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: 'rgba(0,212,255,0.08)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}
                    >
                      {brandLogoUrl ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    {brandLogoUrl && (
                      <button
                        onClick={() => setBrandLogoUrl('')}
                        className="ml-2 text-xs px-2 py-1.5 rounded-lg"
                        style={{ color: '#666' }}
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-xs mt-1" style={{ color: '#555' }}>SVG, PNG or JPG. Max 5MB. Shown in infographic exports.</p>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
              </div>

              {/* Brand Name */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#666' }}>Brand / Company Name</label>
                <input
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-[#7b2ff7] transition-colors"
                  style={{ background: '#0f0f0f', borderColor: '#222', color: '#e5e5e5' }}
                  placeholder="Acme Corp"
                />
              </div>

              {/* Brand Color */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#666' }}>Brand Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={e => setBrandColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    value={brandColor}
                    onChange={e => setBrandColor(e.target.value)}
                    className="w-28 px-3 py-2 rounded-lg border text-xs font-mono outline-none focus:border-[#7b2ff7]"
                    style={{ background: '#0f0f0f', borderColor: '#222', color: '#e5e5e5' }}
                    placeholder="#00d4ff"
                  />
                  <div className="w-8 h-8 rounded-lg" style={{ background: brandColor }} />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: '#666' }}>Website URL</label>
                <input
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-[#7b2ff7] transition-colors"
                  style={{ background: '#0f0f0f', borderColor: '#222', color: '#e5e5e5' }}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="rounded-2xl border p-6" style={{ background: '#141414', borderColor: '#222' }}>
            <h3 className="text-sm font-bold mb-4" style={{ color: '#e5e5e5' }}>Social Profiles</h3>
            <p className="text-xs mb-4" style={{ color: '#666' }}>
              Your handles are used to personalize generated posts (e.g. mentions, tags, profile previews).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#666' }}>LinkedIn</label>
                <div className="flex items-center rounded-lg border overflow-hidden" style={{ borderColor: '#222', background: '#0f0f0f' }}>
                  <span className="px-3 text-xs" style={{ color: '#0077B5' }}>linkedin.com/in/</span>
                  <input
                    value={linkedinHandle}
                    onChange={e => setLinkedinHandle(e.target.value)}
                    className="flex-1 px-2 py-2.5 bg-transparent text-sm outline-none"
                    style={{ color: '#e5e5e5' }}
                    placeholder="your-profile"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#666' }}>X / Twitter</label>
                <div className="flex items-center rounded-lg border overflow-hidden" style={{ borderColor: '#222', background: '#0f0f0f' }}>
                  <span className="px-3 text-xs" style={{ color: '#e5e5e5' }}>@</span>
                  <input
                    value={twitterHandle}
                    onChange={e => setTwitterHandle(e.target.value)}
                    className="flex-1 px-2 py-2.5 bg-transparent text-sm outline-none"
                    style={{ color: '#e5e5e5' }}
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#666' }}>Instagram</label>
                <div className="flex items-center rounded-lg border overflow-hidden" style={{ borderColor: '#222', background: '#0f0f0f' }}>
                  <span className="px-3 text-xs" style={{ color: '#E4405F' }}>@</span>
                  <input
                    value={instagramHandle}
                    onChange={e => setInstagramHandle(e.target.value)}
                    className="flex-1 px-2 py-2.5 bg-transparent text-sm outline-none"
                    style={{ color: '#e5e5e5' }}
                    placeholder="username"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Default Tone */}
          <div className="rounded-2xl border p-6" style={{ background: '#141414', borderColor: '#222' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: '#e5e5e5' }}>Default Content Tone</h3>
            <p className="text-xs mb-4" style={{ color: '#666' }}>Pre-selected when you create new projects.</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'analytical', l: 'Analytical', desc: 'Data-driven, precise' },
                { v: 'conversational', l: 'Conversational', desc: 'Friendly, approachable' },
                { v: 'bold', l: 'Bold', desc: 'Provocative, attention-grabbing' },
                { v: 'corporate', l: 'Corporate', desc: 'Formal, professional' },
              ].map(t => (
                <button
                  key={t.v}
                  onClick={() => setDefaultTone(t.v)}
                  className="p-3 rounded-xl border text-left transition-all"
                  style={{
                    borderColor: defaultTone === t.v ? '#7b2ff7' : '#222',
                    background: defaultTone === t.v ? 'rgba(123,47,247,0.05)' : '#0f0f0f',
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: defaultTone === t.v ? '#7b2ff7' : '#a0a0a0' }}>{t.l}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#555' }}>{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', color: 'white' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save All Changes
        </button>
        {message && (
          <span className="text-sm font-medium" style={{ color: '#00c853' }}>{message}</span>
        )}
      </div>
    </div>
  )
}
