'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'

interface ContentEditorProps {
  content: string
  platform: string
  language: string
  onRegenerate?: () => void
}

export function ContentEditor({ content, platform, language, onRegenerate }: ContentEditorProps) {
  const [text, setText] = useState(content)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: '#141414', borderColor: '#222' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: '#222' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium capitalize px-2 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#a0a0a0' }}>
            {platform}
          </span>
          <span className="text-xs uppercase px-2 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#666' }}>
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button onClick={onRegenerate} className="p-1.5 rounded-lg transition-colors hover:bg-[#1a1a1a]" title="Regenerate">
              <RefreshCw className="w-3.5 h-3.5" style={{ color: '#a0a0a0' }} />
            </button>
          )}
          <button onClick={handleCopy} className="p-1.5 rounded-lg transition-colors hover:bg-[#1a1a1a]" title="Copy">
            {copied ? <Check className="w-3.5 h-3.5" style={{ color: '#00c853' }} /> : <Copy className="w-3.5 h-3.5" style={{ color: '#a0a0a0' }} />}
          </button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-4 bg-transparent resize-none text-sm leading-relaxed outline-none min-h-[200px]"
        style={{ color: '#e5e5e5' }}
      />
    </div>
  )
}
