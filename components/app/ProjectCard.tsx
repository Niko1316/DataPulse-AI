import Link from 'next/link'
import { FileText, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: '#666', label: 'Pending' },
  processing: { icon: Loader2, color: '#ff9800', label: 'Processing' },
  completed: { icon: CheckCircle, color: '#00c853', label: 'Completed' },
  failed: { icon: AlertCircle, color: '#ff3d3d', label: 'Failed' },
}

interface Project {
  id: string
  name: string
  status: string
  file_name?: string
  platforms?: string[]
  languages?: string[]
  created_at: string
}

export function ProjectCard({ project }: { project: Project }) {
  const config = statusConfig[project.status] || statusConfig.pending
  const Icon = config.icon

  return (
    <Link
      href={`/project/${project.id}`}
      className="block rounded-xl border p-4 transition-colors hover:border-[#333]"
      style={{ background: '#141414', borderColor: '#222' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#1a1a1a' }}>
            <FileText className="w-5 h-5" style={{ color: '#00d4ff' }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium truncate" style={{ color: '#e5e5e5' }}>{project.name}</h3>
            <p className="text-xs mt-0.5 truncate" style={{ color: '#666' }}>
              {project.file_name || 'Document'} &middot; {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Icon className={`w-3.5 h-3.5 ${project.status === 'processing' ? 'animate-spin' : ''}`} style={{ color: config.color }} />
          <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
        </div>
      </div>
      {project.platforms && project.platforms.length > 0 && (
        <div className="flex gap-1.5 mt-3">
          {project.platforms.map((p) => (
            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full capitalize" style={{ background: '#1a1a1a', color: '#666' }}>
              {p}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
