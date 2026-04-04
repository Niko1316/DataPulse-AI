'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, Users, ScrollText, Inbox } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin',         label: 'Overview',  icon: LayoutDashboard, exact: true },
  { href: '/admin/jobs',    label: 'Jobs',       icon: Briefcase },
  { href: '/admin/clients', label: 'Clients',    icon: Users },
  { href: '/admin/logs',    label: 'Logs',       icon: ScrollText },
  { href: '/admin/sdr',     label: 'SDR Queue',  icon: Inbox },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              color: isActive ? '#00d4ff' : '#a0a0a0',
              textDecoration: 'none',
              background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              transition: 'background 0.15s, color 0.15s',
              borderLeft: isActive ? '2px solid #00d4ff' : '2px solid transparent',
            }}
            className={isActive ? '' : 'admin-nav-link'}
          >
            <Icon size={16} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
