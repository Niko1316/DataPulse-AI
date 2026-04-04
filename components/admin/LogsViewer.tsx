interface LogEntry {
  id: string
  agent_name: string
  event_type: string
  message: string
  timestamp: string
}

const agentColors: Record<string, string> = {
  overseer: '#00d4ff',
  architect: '#7b2ff7',
  dispatcher: '#00c853',
  sdr: '#ff9800',
}

const eventColors: Record<string, string> = {
  NEW_CLIENT: '#00d4ff',
  PROCESSING: '#ff9800',
  DELIVERY: '#00c853',
  MARKETING: '#7b2ff7',
  ERROR: '#ff3d3d',
}

export function LogsViewer({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="space-y-2">
      {logs.map(log => (
        <div key={log.id} className="rounded-lg border p-3 flex items-start gap-3" style={{ background: '#141414', borderColor: '#222' }}>
          <div
            className="w-2 h-2 rounded-full mt-1.5 shrink-0"
            style={{ background: agentColors[log.agent_name?.toLowerCase()] || '#666' }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium capitalize" style={{ color: agentColors[log.agent_name?.toLowerCase()] || '#666' }}>
                {log.agent_name || 'system'}
              </span>
              {log.event_type && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                  style={{ background: '#1a1a1a', color: eventColors[log.event_type] || '#666' }}
                >
                  {log.event_type}
                </span>
              )}
              <span className="text-[10px] ml-auto" style={{ color: '#666' }}>
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: '#a0a0a0' }}>{log.message}</p>
          </div>
        </div>
      ))}
      {logs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: '#666' }}>No logs found</p>
        </div>
      )}
    </div>
  )
}
