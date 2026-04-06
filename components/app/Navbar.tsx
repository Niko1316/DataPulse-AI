'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Settings, CreditCard } from 'lucide-react'
import { useState } from 'react'
import { LanguageSwitcher } from '@/components/app/LanguageSwitcher'
import { Logo } from '@/components/ui/Logo'

export function Navbar({ user }: { user: { email?: string; full_name?: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-40 border-b h-16 flex items-center px-4 lg:px-8" style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)', borderColor: '#222' }}>
      <Link href="/dashboard" className="flex items-center gap-2 text-lg font-bold gradient-text mr-auto">
        <Logo size={28} />
        DataPulse AI
      </Link>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors"
            style={{ borderColor: '#222', color: '#a0a0a0' }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'linear-gradient(135deg, #00d4ff, #7b2ff7)', color: 'white' }}>
              {(user.full_name || user.email || 'U')[0].toUpperCase()}
            </div>
            <span className="hidden sm:inline text-sm" style={{ color: '#e5e5e5' }}>{user.full_name || user.email}</span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border py-1 shadow-xl" style={{ background: '#141414', borderColor: '#222' }}>
                <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-[#1a1a1a]" style={{ color: '#a0a0a0' }} onClick={() => setMenuOpen(false)}>
                  <Settings className="w-4 h-4" /> Settings
                </Link>
                <Link href="/billing" className="flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-[#1a1a1a]" style={{ color: '#a0a0a0' }} onClick={() => setMenuOpen(false)}>
                  <CreditCard className="w-4 h-4" /> Billing
                </Link>
                <hr style={{ borderColor: '#222' }} />
                <button onClick={handleSignOut} className="flex items-center gap-2 px-4 py-2 text-sm w-full transition-colors hover:bg-[#1a1a1a]" style={{ color: '#ff3d3d' }}>
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
