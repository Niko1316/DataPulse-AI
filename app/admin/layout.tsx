import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminNav } from './_components/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/dashboard')

  const { data: profile } = await supabase
    .from('clients')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/dashboard')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#e5e5e5', fontFamily: 'var(--font-geist-sans, Inter, sans-serif)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '220px',
        flexShrink: 0,
        background: '#0d0d0d',
        borderRight: '1px solid #222',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 0',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 28px', borderBottom: '1px solid #222' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#00d4ff', letterSpacing: '-0.02em' }}>
            DataPulse
          </span>
          <span style={{ fontSize: '11px', display: 'block', color: '#a0a0a0', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Admin Panel
          </span>
        </div>

        {/* Nav — client component for active state via usePathname */}
        <AdminNav />

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #222' }}>
          <span style={{ fontSize: '12px', color: '#a0a0a0' }}>{user.email}</span>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        {children}
      </main>

      <style>{`
        .admin-nav-link:hover {
          background: #1a1a1a !important;
          color: #e5e5e5 !important;
        }
      `}</style>
    </div>
  )
}
