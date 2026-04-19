import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  QrCode,
  Eye,
  Package,
  MapPin,
  CreditCard,
  RefreshCw,
  BarChart3,
  Zap,
} from 'lucide-react'
import { offlineStorage } from '../lib/storage/offline'

export default function Home() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    syncedEvents: 0,
    unsyncedEvents: 0,
  })

  useEffect(() => {
    const stats = offlineStorage.getStats()
    setStats(stats)
  }, [])

  const features = [
    {
      title: 'QR Code Scanning',
      description: 'Scan QR codes on packages for quick identification',
      icon: QrCode,
      href: '/scan',
      color: 'var(--blue)',
      bg: 'var(--blue-bg)',
    },
    {
      title: 'Image Detection',
      description: 'Use ML to detect and count parcels in images',
      icon: Eye,
      href: '/detect',
      color: 'var(--purple)',
      bg: 'var(--purple-bg)',
    },
    {
      title: 'Delivery Management',
      description: 'Track delivery status and updates',
      icon: Package,
      href: '/delivery',
      color: 'var(--green)',
      bg: 'var(--green-bg)',
    },
    {
      title: 'Location Tracking',
      description: 'Real-time GPS location tracking',
      icon: MapPin,
      href: '/location',
      color: 'var(--red)',
      bg: 'var(--red-bg)',
    },
    {
      title: 'Payment Verification',
      description: 'Verify and process payments securely',
      icon: CreditCard,
      href: '/payment',
      color: 'var(--yellow)',
      bg: 'var(--yellow-bg)',
    },
    {
      title: 'Data Synchronization',
      description: 'Synchronize offline data with server',
      icon: RefreshCw,
      href: '/sync',
      color: 'var(--cyan)',
      bg: 'var(--cyan-bg)',
    },
  ]

  const syncPercentage =
    stats.totalEvents > 0
      ? Math.round((stats.syncedEvents / stats.totalEvents) * 100)
      : 0

  return (
    <div style={{ minHeight: '100%' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Zap size={28} style={{ color: 'var(--blue)' }} />
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
            LastMile Scanner PWA
          </h1>
        </div>
        <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Offline-first delivery scanning and tracking platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-3" style={{ marginBottom: '32px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>
                TOTAL EVENTS
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {stats.totalEvents}
              </div>
            </div>
            <BarChart3 size={24} style={{ color: 'var(--blue)', opacity: 0.5 }} />
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>
                SYNCED EVENTS
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--green)' }}>
                {stats.syncedEvents}
              </div>
            </div>
            <div className="badge badge-success" style={{ alignSelf: 'flex-end' }}>
              {syncPercentage}%
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '8px' }}>
                PENDING SYNC
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--yellow)' }}>
                {stats.unsyncedEvents}
              </div>
            </div>
            {stats.unsyncedEvents > 0 && (
              <div className="badge badge-warning" style={{ alignSelf: 'flex-end' }}>
                Action
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-2" style={{ marginBottom: '32px' }}>
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link href={feature.href} key={feature.href} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ height: '100%', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: feature.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={24} style={{ color: feature.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {feature.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="card" style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--blue)', background: 'var(--blue-bg)' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Zap size={20} style={{ color: 'var(--blue)', flexShrink: 0 }} />
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              About This PWA
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              This is an offline-first Progressive Web App designed for last-mile delivery teams. It can be installed on your device and works seamlessly offline. All data is automatically synced when a connection is available.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
