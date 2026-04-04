import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface Job {
  id: string
  job_id: string
  client_email?: string
  status: string
  retry_count: number
  created_at: string
}

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  pending: { icon: Clock, color: '#666' },
  processing: { icon: Loader2, color: '#ff9800' },
  completed: { icon: CheckCircle, color: '#00c853' },
  failed: { icon: AlertCircle, color: '#ff3d3d' },
}

export function JobsTable({ jobs }: { jobs: Job[] }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#222' }}>
      <table className="w-full">
        <thead>
          <tr style={{ background: '#111' }}>
            <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#666' }}>Job ID</th>
            <th className="text-left px-4 py-3 text-xs font-medium hidden sm:table-cell" style={{ color: '#666' }}>Client</th>
            <th className="text-left px-4 py-3 text-xs font-medium" style={{ color: '#666' }}>Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium hidden md:table-cell" style={{ color: '#666' }}>Retries</th>
            <th className="text-left px-4 py-3 text-xs font-medium hidden md:table-cell" style={{ color: '#666' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => {
            const config = statusConfig[job.status] || statusConfig.pending
            const Icon = config.icon
            return (
              <tr key={job.id} className="border-t" style={{ borderColor: '#222' }}>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono" style={{ color: '#a0a0a0' }}>{job.job_id.slice(0, 12)}...</span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm" style={{ color: '#e5e5e5' }}>{job.client_email || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${job.status === 'processing' ? 'animate-spin' : ''}`} style={{ color: config.color }} />
                    <span className="text-xs capitalize" style={{ color: config.color }}>{job.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs" style={{ color: '#666' }}>{job.retry_count}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs" style={{ color: '#666' }}>{new Date(job.created_at).toLocaleString()}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {jobs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: '#666' }}>No jobs found</p>
        </div>
      )}
    </div>
  )
}
