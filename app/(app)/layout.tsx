import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/app/Navbar'
import { Sidebar } from '@/components/app/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, preferred_language, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Navbar user={{ email: user.email, full_name: profile?.full_name }} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  )
}
