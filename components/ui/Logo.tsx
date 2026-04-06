export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
    >
      <rect width="200" height="200" rx="40" fill="#0B0D12" />
      <defs>
        <linearGradient
          id="dp_pulse_grad"
          x1="40"
          y1="40"
          x2="160"
          y2="160"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#00C6FF" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <filter id="dp_glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <path
        d="M60 50C60 44.4772 64.4772 40 70 40H110C137.614 40 160 62.3858 160 90V110C160 137.614 137.614 160 110 160H70C64.4772 160 60 155.523 60 150V50Z"
        stroke="url(#dp_pulse_grad)"
        strokeWidth="12"
        fill="none"
        filter="url(#dp_glow)"
      />
      <path
        d="M50 100H85L95 75L110 125L120 100H155"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ mixBlendMode: 'overlay', opacity: 0.9 }}
      />
      <path
        d="M50 100H85L95 75L110 125L120 100H155"
        stroke="url(#dp_pulse_grad)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#dp_glow)"
      />
    </svg>
  )
}
