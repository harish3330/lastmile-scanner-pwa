import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  QrCode,
  Zap,
  Eye,
  Package,
  MapPin,
  CreditCard,
  RefreshCw,
  Home,
} from 'lucide-react'

const mainLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/scan', label: 'Scan', icon: QrCode },
  { href: '/detect', label: 'Detect', icon: Eye },
  { href: '/delivery', label: 'Delivery', icon: Package },
  { href: '/location', label: 'Location', icon: MapPin },
  { href: '/payment', label: 'Payment', icon: CreditCard },
  { href: '/sync', label: 'Sync', icon: RefreshCw },
]

export default function Sidebar() {
  const router = useRouter()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">
          <Zap size={14} /> LastMile
        </div>
        <div className="sidebar-logo-sub">Scanner PWA</div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Navigation</div>
        {mainLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link ${router.pathname === href ? 'active' : ''}`}
          >
            <Icon className="icon" size={16} />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
