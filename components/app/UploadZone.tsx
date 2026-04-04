'use client'

import { useCallback, useState } from 'react'
import { Upload, FileText, X, Loader2 } from 'lucide-react'

interface UploadZoneProps {
  maxSizeMB: number
  onFileSelect: (file: File) => void
  uploading?: boolean
}

export function UploadZone({ maxSizeMB, onFileSelect, uploading }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const handleFile = useCallback((file: File) => {
    setError('')
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted')
      return
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`)
      return
    }
    setSelectedFile(file)
    onFileSelect(file)
  }, [maxSizeMB, onFileSelect])

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        className="relative rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer"
        style={{
          borderColor: dragOver ? '#00d4ff' : '#222',
          background: dragOver ? 'rgba(0,212,255,0.03)' : '#0a0a0a',
        }}
        onClick={() => { if (!uploading) document.getElementById('file-input')?.click() }}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#00d4ff' }} />
            <p className="text-sm" style={{ color: '#a0a0a0' }}>Uploading...</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <FileText className="w-10 h-10" style={{ color: '#00d4ff' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#e5e5e5' }}>{selectedFile.name}</p>
              <p className="text-xs mt-1" style={{ color: '#666' }}>{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
              className="text-xs flex items-center gap-1" style={{ color: '#ff3d3d' }}
            >
              <X className="w-3 h-3" /> Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-10 h-10" style={{ color: '#666' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#e5e5e5' }}>Drop your PDF here or click to browse</p>
              <p className="text-xs mt-1" style={{ color: '#666' }}>Max {maxSizeMB}MB &middot; PDF only</p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-sm" style={{ color: '#ff3d3d' }}>{error}</p>}
    </div>
  )
}
