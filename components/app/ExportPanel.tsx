'use client'

import { Download, Copy, FileSpreadsheet } from 'lucide-react'

interface ExportPanelProps {
  assets: Array<{ platform: string; language: string; content_text: string }>
}

export function ExportPanel({ assets }: ExportPanelProps) {
  async function copyAll() {
    const text = assets.map(a => `[${a.platform.toUpperCase()} - ${a.language.toUpperCase()}]\n${a.content_text}`).join('\n\n---\n\n')
    await navigator.clipboard.writeText(text)
  }

  function exportCSV() {
    const header = 'Platform,Language,Content\n'
    const rows = assets.map(a =>
      `"${a.platform}","${a.language}","${a.content_text.replace(/"/g, '""')}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'datapulse-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={copyAll}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors hover:border-[#333]"
        style={{ borderColor: '#222', color: '#a0a0a0', background: '#141414' }}
      >
        <Copy className="w-4 h-4" /> Copy All
      </button>
      <button
        onClick={exportCSV}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors hover:border-[#333]"
        style={{ borderColor: '#222', color: '#a0a0a0', background: '#141414' }}
      >
        <FileSpreadsheet className="w-4 h-4" /> Export CSV
      </button>
    </div>
  )
}
