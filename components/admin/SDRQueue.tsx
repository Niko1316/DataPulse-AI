'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Clock } from 'lucide-react'

interface SDRItem {
  id: string
  posts_json: Array<{ content?: string; platform?: string }>
  status: string
  count: number
  created_at: string
}

const statusConfig: Record<string, { color: string; label: string }> = {
  pending_review: { color: '#ff9800', label: 'Pending Review' },
  approved: { color: '#00c853', label: 'Approved' },
  rejected: { color: '#ff3d3d', label: 'Rejected' },
  published: { color: '#00d4ff', label: 'Published' },
}

export function SDRQueue({ items: initialItems }: { items: SDRItem[] }) {
  const [items, setItems] = useState(initialItems)
  const supabase = createClient()

  async function updateStatus(id: string, status: string) {
    await supabase.from('sdr_queue').update({ status }).eq('id', id)
    setItems(prev => prev.map(item => item.id === id ? { ...item, status } : item))
  }

  return (
    <div className="space-y-3">
      {items.map(item => {
        const config = statusConfig[item.status] || statusConfig.pending_review
        return (
          <div key={item.id} className="rounded-xl border p-4" style={{ background: '#141414', borderColor: '#222' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
                <span className="text-xs" style={{ color: '#666' }}>{item.count} posts</span>
              </div>
              <span className="text-xs" style={{ color: '#666' }}>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>

            {item.posts_json?.slice(0, 2).map((post, i) => (
              <div key={i} className="rounded-lg p-3 mb-2" style={{ background: '#0a0a0a' }}>
                <p className="text-sm" style={{ color: '#a0a0a0' }}>{post.content || JSON.stringify(post).slice(0, 200)}</p>
              </div>
            ))}

            {item.status === 'pending_review' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => updateStatus(item.id, 'approved')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(0,200,83,0.1)', color: '#00c853' }}
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => updateStatus(item.id, 'rejected')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(255,61,61,0.1)', color: '#ff3d3d' }}
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            )}
          </div>
        )
      })}
      {items.length === 0 && (
        <div className="text-center py-8 rounded-xl border" style={{ background: '#141414', borderColor: '#222' }}>
          <Clock className="w-8 h-8 mx-auto mb-2" style={{ color: '#666' }} />
          <p className="text-sm" style={{ color: '#666' }}>No posts in queue</p>
        </div>
      )}
    </div>
  )
}
