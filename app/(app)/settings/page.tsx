'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState('')
  const [language, setLanguage] = useState('en')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setFullName(data.full_name || '')
        setLanguage(data.preferred_language || 'en')
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      full_name: fullName,
      preferred_language: language,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    setMessage('Settings saved')
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

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>Settings</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#a0a0a0' }}>Full Name</label>
          <input
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none focus:border-[#00d4ff]"
            style={{ background: '#141414', borderColor: '#222', color: '#e5e5e5' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#a0a0a0' }}>Preferred Language</label>
          <div className="flex gap-2">
            {[{ v: 'en', l: 'English' }, { v: 'fr', l: 'Français' }, { v: 'es', l: 'Español' }].map(lang => (
              <button
                key={lang.v}
                onClick={() => setLanguage(lang.v)}
                className="px-4 py-2.5 rounded-lg border text-sm"
                style={{
                  borderColor: language === lang.v ? '#00d4ff' : '#222',
                  background: language === lang.v ? 'rgba(0,212,255,0.05)' : '#141414',
                  color: language === lang.v ? '#00d4ff' : '#a0a0a0',
                }}
              >
                {lang.l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', color: 'white' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
          {message && <span className="text-sm" style={{ color: '#00c853' }}>{message}</span>}
        </div>
      </div>
    </div>
  )
}
