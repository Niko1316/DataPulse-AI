import Link from 'next/link'
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher'
import { Logo } from '@/components/ui/Logo'
import { getTranslations } from 'next-intl/server'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('nav');

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(12px)', borderColor: '#222' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold gradient-text">
            <Logo size={28} />
            DataPulse AI
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm transition-colors hover:text-[#00d4ff]" style={{ color: '#a0a0a0' }}>{t('pricing')}</Link>
            <Link href="/login" className="text-sm transition-colors hover:text-[#00d4ff]" style={{ color: '#a0a0a0' }}>{t('signIn')}</Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', color: 'white' }}
            >
              {t('startFree')}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>
      <main className="pt-16">{children}</main>
    </div>
  )
}
