import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FileText, Clock, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react'

export const metadata = { title: 'History — DataPulse AI' }

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: '#666', label: 'Pending' },
  processing: { icon: Loader2, color: '#ff9800', label: 'Processing' },
  completed: { icon: CheckCircle, color: '#00c853', label: 'Completed' },
  failed: { icon: AlertCircle, color: '#ff3d3d', label: 'Failed' },
}

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const page = parseInt(pageParam || '1')
  const limit = 20
  const offset = (page - 1) * limit

  const { data: projects, count } = await supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: '#e5e5e5' }}>Project History</h1>

      {projects && projects.length > 0 ? (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#222' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#111' }}>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#666' }}>Document</th>
                <th className="text-left px-4 py-3 text-xs font-medium hidden sm:table-cell" style={{ color: '#666' }}>Platforms</th>
                <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#666' }}>Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium hidden md:table-cell" style={{ color: '#666' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => {
                const config = statusConfig[project.status] || statusConfig.pending
                const Icon = config.icon
                return (
                  <tr key={project.id} className="border-t" style={{ borderColor: '#222' }}>
                    <td className="px-4 py-3">
                      <Link href={`/project/${project.id}`} className="flex items-center gap-3 hover:underline">
                        <FileText className="w-4 h-4 shrink-0" style={{ color: '#00d4ff' }} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#e5e5e5' }}>{project.name}</p>
                          <p className="text-xs truncate" style={{ color: '#666' }}>{project.file_name}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex gap-1">
                        {(project.platforms || []).map((p: string) => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 rounded capitalize" style={{ background: '#1a1a1a', color: '#666' }}>{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${project.status === 'processing' ? 'animate-spin' : ''}`} style={{ color: config.color }} />
                        <span className="text-xs" style={{ color: config.color }}>{config.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs" style={{ color: '#666' }}>{new Date(project.created_at).toLocaleDateString()}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border" style={{ background: '#141414', borderColor: '#222' }}>
          <p style={{ color: '#666' }}>No projects yet</p>
          <Link href="/upload" className="text-sm mt-2 inline-block hover:underline" style={{ color: '#00d4ff' }}>Upload your first document</Link>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/history?page=${p}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{
                background: p === page ? 'rgba(0,212,255,0.1)' : '#141414',
                color: p === page ? '#00d4ff' : '#666',
                border: '1px solid #222',
              }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
