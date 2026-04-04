'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Clock, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  pending:  { color: '#ff9800', bg: 'rgba(255,152,0,0.12)',   label: 'Pending' },
  approved: { color: '#00c853', bg: 'rgba(0,200,83,0.12)',    label: 'Approved' },
  rejected: { color: '#ff3d3d', bg: 'rgba(255,61,61,0.12)',   label: 'Rejected' },
  review:   { color: '#00d4ff', bg: 'rgba(0,212,255,0.12)',   label: 'In Review' },
}

type SDRItem = {
  id: string
  status: string | null
  posts_json: unknown
  created_at: string | null
  job_id: string | null
  client_email: string | null
}

function StatusBadge({ status }: { status: string | null }) {
  const key = status ?? 'pending'
  const style = STATUS_STYLES[key] ?? { color: '#a0a0a0', bg: 'rgba(160,160,160,0.12)', label: key }
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600,
      color: style.color,
      background: style.bg,
      textTransform: 'capitalize',
    }}>
      {key === 'pending' && <Clock size={11} />}
      {key === 'approved' && <CheckCircle size={11} />}
      {key === 'rejected' && <XCircle size={11} />}
      {style.label}
    </span>
  )
}

function PostsPreview({ data, expanded }: { data: unknown; expanded: boolean }) {
  if (!data) return <span style={{ color: '#a0a0a0', fontSize: '13px' }}>No content</span>

  const formatted = typeof data === 'string' ? data : JSON.stringify(data, null, 2)

  return (
    <pre style={{
      margin: 0,
      fontSize: '12px',
      color: '#c0c0c0',
      fontFamily: 'monospace',
      background: '#0d0d0d',
      border: '1px solid #1e1e1e',
      borderRadius: '6px',
      padding: '12px',
      overflow: 'auto',
      maxHeight: expanded ? '400px' : '80px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      transition: 'max-height 0.2s ease',
    }}>
      {formatted}
    </pre>
  )
}

export default function AdminSDRPage() {
  const [items, setItems] = useState<SDRItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [filterStatus, setFilterStatus] = useState<string>('')

  const supabase = createClient()

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    let query = supabase
      .from('sdr_queue')
      .select('id, status, posts_json, created_at, job_id, client_email')
      .order('created_at', { ascending: false })

    if (filterStatus) {
      query = query.eq('status', filterStatus)
    }

    const { data, error: fetchError } = await query
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setItems((data as SDRItem[]) ?? [])
    }
    setLoading(false)
  }, [filterStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  async function updateStatus(id: string, newStatus: 'approved' | 'rejected') {
    setUpdating(id)
    const { error: updateError } = await supabase
      .from('sdr_queue')
      .update({ status: newStatus })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setItems((prev) =>
        prev.map((item) => item.id === id ? { ...item, status: newStatus } : item)
      )
    }
    setUpdating(null)
  }

  function toggleExpanded(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const pending = items.filter((i) => i.status === 'pending').length
  const approved = items.filter((i) => i.status === 'approved').length
  const rejected = items.filter((i) => i.status === 'rejected').length

  const filterOptions = [
    { label: `All (${items.length + (filterStatus ? 0 : 0)})`, value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#e5e5e5', marginBottom: '4px' }}>
            SDR Queue
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '14px' }}>
            Review and moderate AI-generated social posts
          </p>
        </div>
        <button
          onClick={fetchItems}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '8px',
            border: '1px solid #222', background: '#141414',
            color: '#e5e5e5', fontSize: '13px', cursor: 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { label: 'Pending', count: pending, color: '#ff9800' },
          { label: 'Approved', count: approved, color: '#00c853' },
          { label: 'Rejected', count: rejected, color: '#ff3d3d' },
        ].map(({ label, count, color }) => (
          <div key={label} style={{
            background: '#141414',
            border: '1px solid #222',
            borderRadius: '8px',
            padding: '14px 20px',
            minWidth: '120px',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color }}>{count}</div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginTop: '2px' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filterOptions.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilterStatus(value)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              border: `1px solid ${filterStatus === value ? '#00d4ff' : '#222'}`,
              color: filterStatus === value ? '#00d4ff' : '#a0a0a0',
              background: filterStatus === value ? 'rgba(0,212,255,0.08)' : 'transparent',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255,61,61,0.1)',
          border: '1px solid rgba(255,61,61,0.3)',
          borderRadius: '8px',
          color: '#ff3d3d',
          fontSize: '13px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#a0a0a0', fontSize: '14px' }}>
          Loading queue...
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div style={{
          background: '#141414',
          border: '1px solid #222',
          borderRadius: '10px',
          padding: '60px',
          textAlign: 'center',
          color: '#a0a0a0',
          fontSize: '14px',
        }}>
          {filterStatus ? `No ${filterStatus} items in the queue.` : 'The SDR queue is empty.'}
        </div>
      )}

      {/* Items */}
      {!loading && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map((item) => {
            const isExpanded = expanded[item.id] ?? false
            const isUpdating = updating === item.id
            const isPending = item.status === 'pending' || item.status === null

            return (
              <div
                key={item.id}
                style={{
                  background: '#141414',
                  border: '1px solid #222',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                {/* Card header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderBottom: isExpanded ? '1px solid #1e1e1e' : 'none',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <StatusBadge status={item.status} />
                    <div>
                      <code style={{ fontSize: '11px', color: '#7b2ff7', fontFamily: 'monospace' }}>
                        {item.id.slice(0, 16)}…
                      </code>
                      {item.client_email && (
                        <span style={{ fontSize: '12px', color: '#a0a0a0', marginLeft: '8px' }}>
                          {item.client_email}
                        </span>
                      )}
                    </div>
                    {item.created_at && (
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(item.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Approve / Reject buttons — show for non-approved/rejected */}
                    {isPending && (
                      <>
                        <button
                          onClick={() => updateStatus(item.id, 'approved')}
                          disabled={isUpdating}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '6px 12px', borderRadius: '6px',
                            border: '1px solid rgba(0,200,83,0.4)',
                            background: 'rgba(0,200,83,0.1)',
                            color: '#00c853', fontSize: '12px', fontWeight: 600,
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            opacity: isUpdating ? 0.5 : 1,
                          }}
                        >
                          <CheckCircle size={13} />
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, 'rejected')}
                          disabled={isUpdating}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '6px 12px', borderRadius: '6px',
                            border: '1px solid rgba(255,61,61,0.4)',
                            background: 'rgba(255,61,61,0.1)',
                            color: '#ff3d3d', fontSize: '12px', fontWeight: 600,
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            opacity: isUpdating ? 0.5 : 1,
                          }}
                        >
                          <XCircle size={13} />
                          Reject
                        </button>
                      </>
                    )}

                    {/* Re-queue button for already-decided items */}
                    {!isPending && (
                      <button
                        onClick={() => updateStatus(item.id, 'approved')}
                        disabled={isUpdating || item.status === 'approved'}
                        style={{
                          padding: '5px 10px', borderRadius: '6px',
                          border: '1px solid #333',
                          background: 'transparent',
                          color: item.status === 'approved' ? '#00c853' : '#a0a0a0',
                          fontSize: '12px',
                          cursor: item.status === 'approved' ? 'default' : 'pointer',
                          opacity: isUpdating ? 0.5 : 1,
                        }}
                      >
                        {item.status === 'approved' ? 'Approved' : 'Approve'}
                      </button>
                    )}

                    {/* Expand toggle */}
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '6px 10px', borderRadius: '6px',
                        border: '1px solid #222', background: 'transparent',
                        color: '#a0a0a0', fontSize: '12px', cursor: 'pointer',
                      }}
                    >
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      {isExpanded ? 'Hide' : 'View'}
                    </button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ padding: '14px 16px' }}>
                    {item.job_id && (
                      <div style={{ marginBottom: '10px', fontSize: '12px', color: '#a0a0a0' }}>
                        Job ID: <code style={{ color: '#00d4ff', fontFamily: 'monospace' }}>{item.job_id}</code>
                      </div>
                    )}
                    <PostsPreview data={item.posts_json} expanded={isExpanded} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
