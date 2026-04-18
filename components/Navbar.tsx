import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from '@/lib/context/ThemeContext';
import { useAuth } from '@/lib/context/AuthContext';
import { Zap, Sun, Moon, Truck, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar() {
    const { theme, toggle } = useTheme();
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const isAdmin = user?.role === 'admin';
    const isDelivery = user?.role === 'delivery';

    return (
        <nav className="navbar">
            {/* Brand */}
            <Link href="/" className="navbar-brand">
                <Zap size={17} />
                Smart Parcel
                <span>Tracking & Delivery</span>
            </Link>

            <div className="navbar-right">
                {/* Dashboard nav pills (only for logged-in users) */}
                {isDelivery && (
                    <Link href="/delivery-dashboard"
                        className={`nav-pill ${router.asPath.startsWith('/delivery') ? 'active' : ''}`}>
                        <Truck size={12} style={{ display: 'inline', marginRight: 4 }} />Delivery
                    </Link>
                )}
                {isAdmin && (
                    <Link href="/admin/dashboard"
                        className={`nav-pill ${router.asPath.startsWith('/admin') ? 'active' : ''}`}>
                        <LayoutDashboard size={12} style={{ display: 'inline', marginRight: 4 }} />Admin
                    </Link>
                )}

                {/* User chip */}
                {user && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '5px 12px', border: '1px solid var(--border)',
                        borderRadius: 100, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
                        background: 'var(--bg-card)',
                    }}>
                        {isAdmin
                            ? <ShieldCheck size={13} color="var(--purple)" />
                            : <Truck size={13} color="var(--blue)" />}
                        <span>{user.name}</span>
                    </div>
                )}

                {/* Theme toggle */}
                <button className="theme-toggle" onClick={toggle} id="theme-toggle-btn">
                    {theme === 'dark' ? <><Sun size={13} /> Light</> : <><Moon size={13} /> Dark</>}
                </button>

                {/* Logout */}
                {user && (
                    <button className="btn btn-outline btn-sm" onClick={handleLogout} id="logout-btn"
                        style={{ gap: 6 }}>
                        <LogOut size={13} /> Logout
                    </button>
                )}
            </div>
        </nav>
    );
}
