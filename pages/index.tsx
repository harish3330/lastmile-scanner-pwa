import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="home-page animate-in">
            <div>
                <div>
                    <h1 className="home-title">
                        Smart Parcel Tracking
                    </h1>
                    <p style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        & Delivery System
                    </p>
                    <p className="home-sub" style={{ marginTop: 8 }}>Choose your dashboard to get started</p>
                </div>
            </div>

            <div className="home-cards">
                {/* Delivery Dashboard */}
                <Link href="/delivery-dashboard" className="home-card" id="delivery-dashboard-card">
                    <div className="home-card-icon" style={{ background: 'var(--blue-bg)', color: 'var(--blue)' }}>
                        <Truck size={28} />
                    </div>
                    <div className="home-card-title">Delivery Dashboard</div>
                    <div className="home-card-desc">
                        For delivery personnel. Scan parcels, manage deliveries,
                        track GPS location, and record payments in the field.
                    </div>
                    <div className="home-card-arrow">
                        Open Dashboard <ArrowRight size={14} />
                    </div>
                </Link>

                {/* Admin Dashboard */}
                <Link href="/admin/dashboard" className="home-card" id="admin-dashboard-card">
                    <div className="home-card-icon" style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}>
                        <ShieldCheck size={28} />
                    </div>
                    <div className="home-card-title">Admin Dashboard</div>
                    <div className="home-card-desc">
                        For administrators. View delivery logs, monitor locations,
                        track payments, detect cash mismatches, and review analytics.
                    </div>
                    <div className="home-card-arrow" style={{ color: 'var(--purple)' }}>
                        Open Dashboard <ArrowRight size={14} />
                    </div>
                </Link>
            </div>

            <p style={{ marginTop: 48, fontSize: 12, color: 'var(--text-muted)' }}>
                Use the theme toggle in the top-right to switch between Light and Dark mode
            </p>
        </div>
    );
}
