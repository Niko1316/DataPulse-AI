export function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const isHigh = pct > 70
  const isFull = pct >= 100

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span style={{ color: '#a0a0a0' }}>{label}</span>
        <span style={{ color: isFull ? '#ff3d3d' : isHigh ? '#ff9800' : '#e5e5e5' }}>
          {used}/{limit}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: isFull ? '#ff3d3d' : isHigh ? '#ff9800' : 'linear-gradient(90deg, #00d4ff, #7b2ff7)',
          }}
        />
      </div>
    </div>
  )
}
