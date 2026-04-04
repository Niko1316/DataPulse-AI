import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 25

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dashboard')

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const q = params.q?.trim() ?? ''
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('clients')
    .select('id, email, stripe_customer_id, created_at, subscription_status', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (q) {
    query = query.ilike('email', `%${q}%`)
  }

  const { data: clients, count } = await query

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
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#e5e5e5', marginBottom: '4px' }}>Clients</h1>
        <p style={{ color: '#a0a0a0', fontSize: '14px' }}>
          {count?.toLocaleString() ?? 0} registered clients{q ? ` matching "${q}"` : ''}
        </p>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/clients" style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <Search
            size={15}
            color="#a0a0a0"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by email…"
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              background: '#141414',
              border: '1px solid #222',
              borderRadius: '8px',
              color: '#e5e5e5',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </form>

      <div style={{ background: '#141414', border: '1px solid #222', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Stripe Customer ID</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Created</th>
              </tr>
            </thead>
            <tbody>
              {(clients ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#a0a0a0', padding: '40px' }}>
                    {q ? `No clients found matching "${q}".` : 'No clients yet.'}
                  </td>
                </tr>
              ) : (clients ?? []).map((client) => (
                <tr key={client.id} className="clients-row">
                  <td style={tdStyle}>{client.email ?? '—'}</td>
                  <td style={tdStyle}>
                    {client.stripe_customer_id
                      ? <code style={{ fontSize: '12px', color: '#7b2ff7', fontFamily: 'monospace' }}>{client.stripe_customer_id}</code>
                      : <span style={{ color: '#a0a0a0' }}>—</span>}
                  </td>
                  <td style={tdStyle}>
                    {client.subscription_status ? (
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: client.subscription_status === 'active' ? '#00c853' : '#a0a0a0',
                        background: client.subscription_status === 'active' ? 'rgba(0,200,83,0.12)' : 'rgba(160,160,160,0.12)',
                        textTransform: 'capitalize',
                      }}>
                        {client.subscription_status}
                      </span>
                    ) : (
                      <span style={{ color: '#a0a0a0', fontSize: '13px' }}>—</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, color: '#a0a0a0' }}>
                    {client.created_at
                      ? new Date(client.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
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
                  href={`/admin/clients?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
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
                  href={`/admin/clients?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
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
        .clients-row:hover td { background: #1a1a1a !important; }
      `}</style>
    </div>
  )
}
