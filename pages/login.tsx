import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { Zap, Mail, Lock, Sun, Moon, Eye, EyeOff, ShieldCheck, Truck, ChevronDown, ChevronUp } from 'lucide-react';

/* All demo credentials — shown in the hint panel */
const AGENT_ACCOUNTS = [
    { name: 'Ravi Kumar', email: 'ravi@delivery.com', pass: 'ravi123' },
    { name: 'Priya Sharma', email: 'priya@delivery.com', pass: 'priya123' },
    { name: 'Ankit Mehta', email: 'ankit@delivery.com', pass: 'ankit123' },
    { name: 'Leena Roy', email: 'leena@delivery.com', pass: 'leena123' },
    { name: 'Sunita Tiwari', email: 'sunita@delivery.com', pass: 'sunita123' },
];

export default function LoginPage() {
    const { login } = useAuth();
    const { theme, toggle } = useTheme();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [role, setRole] = useState('');
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAgents, setShowAgents] = useState(false);

    const autofill = (r: string, em: string, pw: string) => {
        setRole(r);
        setEmail(em);
        setPass(pw);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !pass || !role) {
            setError('Please fill in all fields and select a role.');
            return;
        }
        setLoading(true);
        await new Promise(r => setTimeout(r, 600));
        const result = login(email.trim().toLowerCase(), pass, role);
        setLoading(false);
        if (!result.ok) {
            setError(result.error || 'Login failed');
        } else {
            router.push(role === 'admin' ? '/admin/dashboard' : '/delivery-dashboard');
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-app)', padding: '24px',
        }}>
            {/* Theme toggle */}
            <button className="theme-toggle" onClick={toggle} style={{ position: 'fixed', top: 18, right: 20 }}>
                {theme === 'dark' ? <><Sun size={13} /> Light</> : <><Moon size={13} /> Dark</>}
            </button>

            <div style={{ width: '100%', maxWidth: 440 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 16, margin: '0 auto 14px',
                        background: 'linear-gradient(135deg, var(--blue), var(--cyan))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
                    }}>
                        <Zap size={26} color="white" />
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>Smart Parcel Tracking</h1>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Sign in to access your dashboard</p>
                </div>

                {/* Quick-fill role cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                    {/* Admin card */}
                    <button onClick={() => autofill('admin', 'admin@gmail.com', 'admin123')} style={{
                        background: role === 'admin' ? 'rgba(139,92,246,0.12)' : 'var(--bg-card)',
                        border: `1px solid ${role === 'admin' ? 'var(--purple)' : 'var(--border)'}`,
                        borderRadius: 10, padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                    }}>
                        <ShieldCheck size={16} color="var(--purple)" style={{ marginBottom: 6 }} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Admin</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Click to autofill</div>
                    </button>

                    {/* Delivery card — clicking cycles through agents */}
                    <button onClick={() => { autofill('delivery', AGENT_ACCOUNTS[0].email, AGENT_ACCOUNTS[0].pass); setShowAgents(true); }} style={{
                        background: role === 'delivery' ? 'rgba(59,130,246,0.12)' : 'var(--bg-card)',
                        border: `1px solid ${role === 'delivery' ? 'var(--blue)' : 'var(--border)'}`,
                        borderRadius: 10, padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                    }}>
                        <Truck size={16} color="var(--blue)" style={{ marginBottom: 6 }} />
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Delivery Agent</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Click to autofill</div>
                    </button>
                </div>

                {/* Form Card */}
                <div className="card" style={{ padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
                    {error && (
                        <div className="alert alert-danger" style={{ marginBottom: 18, fontSize: 13 }}>
                            <span>⚠ {error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Role */}
                        <div className="form-group">
                            <label className="form-label">Select Role</label>
                            <select id="login-role" className="form-select" value={role}
                                onChange={e => { setRole(e.target.value); setError(''); }}>
                                <option value="">— Select your role —</option>
                                <option value="admin">Admin</option>
                                <option value="delivery">Delivery Agent</option>
                            </select>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input id="login-email" className="form-input" type="email"
                                    placeholder="you@example.com" value={email}
                                    onChange={e => { setEmail(e.target.value); setError(''); }}
                                    style={{ paddingLeft: 38 }} />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input id="login-password" className="form-input"
                                    type={show ? 'text' : 'password'} placeholder="Enter password"
                                    value={pass}
                                    onChange={e => { setPass(e.target.value); setError(''); }}
                                    style={{ paddingLeft: 38, paddingRight: 42 }} />
                                <button type="button" onClick={() => setShow(s => !s)} style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
                                }}>
                                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Role redirect preview */}
                        {role && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                                background: 'var(--bg-app)', borderRadius: 8, marginBottom: 18,
                                border: '1px solid var(--border)', fontSize: 13,
                            }}>
                                {role === 'admin'
                                    ? <ShieldCheck size={14} color="var(--purple)" />
                                    : <Truck size={14} color="var(--blue)" />}
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    Redirecting to <strong style={{ color: role === 'admin' ? 'var(--purple)' : 'var(--blue)' }}>
                                        {role === 'admin' ? 'Admin' : 'Delivery Agent'} Dashboard
                                    </strong> on login
                                </span>
                            </div>
                        )}

                        <button id="login-submit" type="submit" className="btn btn-primary" disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', height: 44, fontSize: 15 }}>
                            {loading
                                ? <><span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /> Signing in…</>
                                : 'Sign In'}
                        </button>
                    </form>

                    {/* Demo credentials panel */}
                    <div style={{ marginTop: 20, borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
                        <button onClick={() => setShowAgents(s => !s)} style={{
                            width: '100%', padding: '10px 14px', background: 'var(--bg-app)',
                            border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', fontFamily: 'Inter, sans-serif',
                        }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Demo Credentials
                            </span>
                            {showAgents ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                        </button>

                        {showAgents && (
                            <div style={{ padding: '0 14px 14px', background: 'var(--bg-app)' }}>
                                {/* Admin row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)' }}>Admin</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>admin@gmail.com · admin123</div>
                                    </div>
                                    <button onClick={() => autofill('admin', 'admin@gmail.com', 'admin123')}
                                        className="btn btn-outline btn-sm" style={{ fontSize: 10 }}>Use</button>
                                </div>

                                {/* Delivery agent rows */}
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 10, marginBottom: 6 }}>
                                    Delivery Agents
                                </div>
                                {AGENT_ACCOUNTS.map(a => (
                                    <div key={a.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                                        <div>
                                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)' }}>{a.name}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{a.email} · {a.pass}</div>
                                        </div>
                                        <button onClick={() => autofill('delivery', a.email, a.pass)}
                                            className="btn btn-outline btn-sm" style={{ fontSize: 10 }}>Use</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
