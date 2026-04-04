import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  completed:  { color: '#00c853', bg: 'rgba(0,200,83,0.12)',    label: 'Completed' },
  processing: { color: '#00d4ff', bg: 'rgba(0,212,255,0.12)',   label: 'Processing' },
  pending:    { color: '#ff9800', bg: 'rgba(255,152,0,0.12)',   label: 'Pending' },
  failed:     { color: '#ff3d3d', bg: 'rgba(255,61,61,0.12)',   label: 'Failed' },
  queued:     { color: '#a0a0a0', bg: 'rgba(160,160,160,0.12)', label: 'Queued' },
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { color: '#a0a0a0', bg: 'rgba(160,160,160,0.12)', label: status }
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      color: style.color,
      background: style.bg,
      textTransform: 'capitalize',
    }}>
      {style.label}
    </span>
  )
}

function truncate(str: string | null | undefined, len = 12) {
  if (!str) return '—'
  return str.length > len ? `${str.slice(0, len)}…` : str
}

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dashboard')

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: jobs, count } = await supabase
    .from('jobs')
    .select('id, client_email, status, created_at, retry_count', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    color: '#a0a0a0',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid #222',
    whiteSpace: 'nowrap',
  }

  const tdStyle: React.CSSProperties = {
    padding: '13px 16px',
    fontSize: '13px',
    color: '#e5e5e5',
    borderBottom: '1px solid #1a1a1a',
    whiteSpace: 'nowrap',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#e5e5e5', marginBottom: '4px' }}>Jobs</h1>
          <p style={{ color: '#a0a0a0', fontSize: '14px' }}>
            {count?.toLocaleString() ?? 0} total jobs
          </p>
        </div>
      </div>

      <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Job ID</th>
                <th style={thStyle}>Client Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Created</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Retries</th>
              </tr>
            </thead>
            <tbody>
              {(jobs ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#a0a0a0', padding: '40px' }}>
                    No jobs found.
                  </td>
                </tr>
              ) : (jobs ?? []).map((job) => (
                <tr key={job.id} style={{ transition: 'background 0.1s' }} className="jobs-row">
                  <td style={tdStyle}>
                    <code style={{ fontSize: '12px', color: '#00d4ff', fontFamily: 'monospace' }}>
                      {truncate(job.id, 14)}
                    </code>
                  </td>
                  <td style={tdStyle}>{job.client_email ?? '—'}</td>
                  <td style={tdStyle}><StatusBadge status={job.status ?? 'unknown'} /></td>
                  <td style={{ ...tdStyle, color: '#a0a0a0' }}>
                    {job.created_at
                      ? new Date(job.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{
                      color: (job.retry_count ?? 0) > 0 ? '#ff9800' : '#a0a0a0',
                      fontWeight: (job.retry_count ?? 0) > 0 ? 600 : 400,
                    }}>
                      {job.retry_count ?? 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderTop: '1px solid #222',
          }}>
            <span style={{ fontSize: '13px', color: '#a0a0a0' }}>
              Page {page} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {page > 1 && (
                <Link
                  href={`/admin/jobs?page=${page - 1}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 12px', borderRadius: '6px',
                    border: '1px solid #222', background: '#0a0a0a',
                    color: '#e5e5e5', fontSize: '13px', textDecoration: 'none',
                  }}
                >
                  <ChevronLeft size={14} /> Prev
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/jobs?page=${page + 1}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 12px', borderRadius: '6px',
                    border: '1px solid #222', background: '#0a0a0a',
                    color: '#e5e5e5', fontSize: '13px', textDecoration: 'none',
                  }}
                >
                  Next <ChevronRight size={14} />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .jobs-row:hover td { background: #1a1a1a !important; }
      `}</style>
    </div>
  )
}
