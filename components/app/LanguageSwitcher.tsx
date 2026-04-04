'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'es', label: 'ES' },
]

export function LanguageSwitcher() {
  const router = useRouter()
  const currentLocale = useLocale()

  function handleLocaleChange(locale: string) {
    document.cookie = `locale=${locale}; path=/; max-age=31536000; SameSite=Lax`
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {LOCALES.map(({ code, label }) => {
        const isActive = currentLocale === code
        return (
          <button
            key={code}
            onClick={() => handleLocaleChange(code)}
            title={label}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
              color: isActive ? '#00d4ff' : '#a0a0a0',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.color = '#e5e5e5'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.color = '#a0a0a0'
              }
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
