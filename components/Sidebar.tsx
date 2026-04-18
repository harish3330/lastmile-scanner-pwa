/**
 * @file components/Sidebar.tsx
 * @owner Sahana-268 (Issue #2 — Frontend UI & Dashboard)
 *
 * Global sidebar navigation used across all non-admin pages.
 * Renders two sections:
 *
 *   MAIN section — links to agent-facing pages:
 *     /scan        → pages/scan.tsx
 *     /delivery    → pages/delivery.tsx
 *     /warehouse   → pages/warehouse.tsx
 *     /payments    → pages/payments.tsx
 *
 *   ADMIN section — links to admin-only pages:
 *     /admin/dashboard     → pages/admin/dashboard.tsx
 *     /admin/deliveryLogs  → pages/admin/deliveryLogs.tsx
 *     /admin/locationLogs  → pages/admin/locationLogs.tsx
 *
 * NOTE: pages/admin/dashboard.tsx has its OWN internal tab-switcher sidebar
 * (Delivery Logs, Location Logs, Payment Monitoring, Analytics tabs).
 * That is an intentional UX decision for a unified admin shell experience.
 * See the JSDoc comment in dashboard.tsx for full details.
 * This Sidebar component is NOT used inside the admin dashboard layout.
 */

import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    QrCode, Truck, Warehouse, CreditCard,
    ClipboardList, MapPin, Zap
} from 'lucide-react';

const mainLinks = [
    { href: '/scan', label: 'Scan', icon: QrCode },
    { href: '/delivery', label: 'Delivery', icon: Truck },
    { href: '/warehouse', label: 'Warehouse', icon: Warehouse },
    { href: '/payments', label: 'Payment', icon: CreditCard },
];

const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: Zap },
    { href: '/admin/deliveryLogs', label: 'Delivery Logs', icon: ClipboardList },
    { href: '/admin/locationLogs', label: 'Location Logs', icon: MapPin },
];

export default function Sidebar() {
    const router = useRouter();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-text">
                    <Zap size={14} style={{ display: 'inline', marginRight: 6 }} />
                    LastMile
                </div>
                <div className="sidebar-logo-sub">Scanner PWA</div>
            </div>

            <div className="sidebar-section">
                <div className="sidebar-section-label">Main</div>
                {mainLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`sidebar-link ${router.pathname === href ? 'active' : ''}`}
                    >
                        <Icon className="icon" />
                        {label}
                    </Link>
                ))}
            </div>

            <div className="sidebar-section">
                <div className="sidebar-section-label">Admin</div>
                {adminLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`sidebar-link ${router.pathname === href ? 'active' : ''}`}
                    >
                        <Icon className="icon" />
                        {label}
                    </Link>
                ))}
            </div>
        </aside>
    );
}
