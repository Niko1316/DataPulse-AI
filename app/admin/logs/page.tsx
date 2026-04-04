import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

const AGENT_STYLES: Record<string, { color: string; bg: string }> = {
  Overseer:   { color: '#00d4ff', bg: 'rgba(0,212,255,0.12)' },
  Architect:  { color: '#7b2ff7', bg: 'rgba(123,47,247,0.12)' },
  Dispatcher: { color: '#00c853', bg: 'rgba(0,200,83,0.12)' },
  SDR:        { color: '#ff9800', bg: 'rgba(255,152,0,0.12)' },
}

const AGENTS = ['Overseer', 'Architect', 'Dispatcher', 'SDR']

function AgentBadge({ agent }: { agent: string | null }) {
  const name = agent ?? 'unknown'
  const style = AGENT_STYLES[name] ?? { color: '#a0a0a0', bg: 'rgba(160,160,160,0.12)' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      color: style.color,
      background: style.bg,
    }}>
      {name}
    </span>
  )
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; agent?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dashboard')

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const agentFilter = params.agent ?? ''
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('system_logs')
    .select('id, agent_name, event_type, message, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (agentFilter) {
    query = query.eq('agent_name', agentFilter)
  }

  const { data: logs, count } = await query
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
    padding: '11px 16px',
    fontSize: '13px',
    color: '#e5e5e5',
    borderBottom: '1px solid #1a1a1a',
    verticalAlign: 'top',
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#e5e5e5', marginBottom: '4px' }}>System Logs</h1>
        <p style={{ color: '#a0a0a0', fontSize: '14px' }}>
          {count?.toLocaleString() ?? 0} entries{agentFilter ? ` · filtered by ${agentFilter}` : ''}
        </p>
      </div>

      {/* Agent filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Link
          href="/admin/logs"
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
            border: `1px solid ${agentFilter === '' ? '#00d4ff' : '#222'}`,
            color: agentFilter === '' ? '#00d4ff' : '#a0a0a0',
            background: agentFilter === '' ? 'rgba(0,212,255,0.08)' : 'transparent',
          }}
        >
          All
        </Link>
        {AGENTS.map((agent) => {
          const style = AGENT_STYLES[agent] ?? { color: '#a0a0a0', bg: 'transparent' }
          const isActive = agentFilter === agent
          return (
            <Link
              key={agent}
              href={`/admin/logs?agent=${encodeURIComponent(agent)}`}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
                border: `1px solid ${isActive ? style.color : '#222'}`,
                color: isActive ? style.color : '#a0a0a0',
                background: isActive ? style.bg : 'transparent',
              }}
            >
              {agent}
            </Link>
          )
        })}
      </div>

      <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '120px' }}>Agent</th>
                <th style={{ ...thStyle, width: '140px' }}>Event Type</th>
                <th style={thStyle}>Message</th>
                <th style={{ ...thStyle, width: '170px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#a0a0a0', padding: '40px' }}>
                    No logs found.
                  </td>
                </tr>
              ) : (logs ?? []).map((log) => (
                <tr key={log.id} className="logs-row">
                  <td style={tdStyle}><AgentBadge agent={log.agent_name} /></td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '12px', color: '#a0a0a0', fontFamily: 'monospace' }}>
                      {log.event_type ?? '—'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, maxWidth: '480px', wordBreak: 'break-word', whiteSpace: 'pre-wrap', color: '#c0c0c0' }}>
                    {log.message ?? '—'}
                  </td>
                  <td style={{ ...tdStyle, color: '#a0a0a0', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {log.created_at
                      ? new Date(log.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit', second: '2-digit',
                        })
                      : '—'}
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
                  href={`/admin/logs?page=${page - 1}${agentFilter ? `&agent=${encodeURIComponent(agentFilter)}` : ''}`}
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
                  href={`/admin/logs?page=${page + 1}${agentFilter ? `&agent=${encodeURIComponent(agentFilter)}` : ''}`}
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
        .logs-row:hover td { background: #1a1a1a !important; }
      `}</style>
    </div>
  )
}
