import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Search, AlertTriangle, CheckCircle, Clock, Smartphone, Banknote, CreditCard } from 'lucide-react';

const PAYMENTS = [
    { id: 'PAY-001', order: 'DEL-2841', agent: 'Ravi Kumar', expected: 450, collected: 450, mode: 'UPI', status: 'matched', date: '2026-04-15 07:02' },
    { id: 'PAY-002', order: 'DEL-2842', agent: 'Priya Sharma', expected: 320, collected: 300, mode: 'Cash', status: 'mismatch', date: '2026-04-15 07:08' },
    { id: 'PAY-003', order: 'DEL-2843', agent: 'Ankit Mehta', expected: 870, collected: 870, mode: 'Card', status: 'matched', date: '2026-04-15 07:15' },
    { id: 'PAY-004', order: 'DEL-2844', agent: 'Leena Roy', expected: 560, collected: 600, mode: 'Cash', status: 'mismatch', date: '2026-04-15 07:20' },
    { id: 'PAY-005', order: 'DEL-2845', agent: 'Sunita Tiwari', expected: 150, collected: 150, mode: 'UPI', status: 'matched', date: '2026-04-15 07:22' },
    { id: 'PAY-006', order: 'DEL-2846', agent: 'Deepak Nair', expected: 1200, collected: 1250, mode: 'Cash', status: 'mismatch', date: '2026-04-15 07:30' },
    { id: 'PAY-007', order: 'DEL-2847', agent: 'Ravi Kumar', expected: 340, collected: 0, mode: 'UPI', status: 'pending', date: '2026-04-15 07:40' },
    { id: 'PAY-008', order: 'DEL-2848', agent: 'Priya Sharma', expected: 790, collected: 790, mode: 'Card', status: 'matched', date: '2026-04-14 17:00' },
    { id: 'PAY-009', order: 'DEL-2849', agent: 'Ankit Mehta', expected: 220, collected: 220, mode: 'UPI', status: 'matched', date: '2026-04-14 16:30' },
    { id: 'PAY-010', order: 'DEL-2850', agent: 'Sunita Tiwari', expected: 475, collected: 0, mode: 'Cash', status: 'pending', date: '2026-04-14 16:00' },
];

const MODE_ICONS: Record<string, any> = { UPI: <Smartphone size={12} />, Cash: <Banknote size={12} />, Card: <CreditCard size={12} /> };

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6'];

export default function PaymentStatus() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const matched = PAYMENTS.filter(p => p.status === 'matched').length;
    const mismatched = PAYMENTS.filter(p => p.status === 'mismatch').length;
    const pending = PAYMENTS.filter(p => p.status === 'pending').length;
    const totalCollected = PAYMENTS.reduce((a, p) => a + p.collected, 0);
    const totalExpected = PAYMENTS.reduce((a, p) => a + p.expected, 0);

    const upiCount = PAYMENTS.filter(p => p.mode === 'UPI').length;
    const cashCount = PAYMENTS.filter(p => p.mode === 'Cash').length;
    const cardCount = PAYMENTS.filter(p => p.mode === 'Card').length;

    const pieData = [
        { name: 'UPI', value: upiCount },
        { name: 'Cash', value: cashCount },
        { name: 'Card', value: cardCount },
    ];

    const filtered = PAYMENTS.filter(p => {
        const q = search.toLowerCase();
        const matchSearch = p.id.toLowerCase().includes(q) || p.agent.toLowerCase().includes(q) || p.order.toLowerCase().includes(q);
        const matchFilter = filter === 'all' || p.status === filter;
        return matchSearch && matchFilter;
    });

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">Payment Status</h1>
                <p className="page-subtitle">All transactions, mismatches, and settlement overview</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { label: 'Total Expected', value: `₹${totalExpected.toLocaleString()}`, color: 'var(--blue-bright)', bg: 'rgba(59,130,246,0.12)', icon: <DollarSign size={20} /> },
                    { label: 'Total Collected', value: `₹${totalCollected.toLocaleString()}`, color: 'var(--green-primary)', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle size={20} /> },
                    { label: 'Mismatches', value: mismatched, color: 'var(--red-primary)', bg: 'rgba(239,68,68,0.12)', icon: <AlertTriangle size={20} /> },
                    { label: 'Pending', value: pending, color: 'var(--yellow-primary)', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={20} /> },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-number" style={{ color: s.color, fontSize: typeof s.value === 'string' ? 20 : 26 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, marginBottom: 24 }}>
                {/* Mismatch Alert Box */}
                <div className="card" style={{ borderColor: mismatched > 0 ? 'rgba(239,68,68,0.3)' : 'var(--border)' }}>
                    <div className="card-title" style={{ marginBottom: 14 }}>Settlement Summary</div>
                    {[
                        { label: 'Matched', value: matched, color: 'var(--green-primary)', bar: 'var(--green-primary)' },
                        { label: 'Mismatch', value: mismatched, color: 'var(--red-primary)', bar: 'var(--red-primary)' },
                        { label: 'Pending', value: pending, color: 'var(--yellow-primary)', bar: 'var(--yellow-primary)' },
                    ].map(s => (
                        <div key={s.label} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value} / {PAYMENTS.length}</span>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${(s.value / PAYMENTS.length) * 100}%`, background: s.bar }} />
                            </div>
                        </div>
                    ))}
                    {mismatched > 0 && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8, fontSize: 13, color: 'var(--red-primary)', marginTop: 4,
                        }}>
                            <AlertTriangle size={14} />
                            {mismatched} mismatch(es) require review. Variance: ₹{Math.abs(totalExpected - totalCollected)}
                        </div>
                    )}
                </div>

                {/* Pie Chart */}
                <div className="card" style={{ textAlign: 'center' }}>
                    <div className="card-title" style={{ marginBottom: 8 }}>Payment Modes</div>
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                        {pieData.map((d, i) => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                                <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i] }} />
                                {d.name} ({d.value})
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter + Table */}
            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search className="search-icon" />
                    <input className="search-input" placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {[['all', 'All'], ['matched', 'Matched'], ['mismatch', 'Mismatch'], ['pending', 'Pending']].map(([f, label]) => (
                    <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
                        {label}
                    </button>
                ))}
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Pay ID</th><th>Order</th><th>Agent</th><th>Expected</th><th>Collected</th><th>Variance</th><th>Mode</th><th>Date</th><th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(p => {
                            const diff = p.collected - p.expected;
                            return (
                                <tr key={p.id} style={p.status === 'mismatch' ? { background: 'rgba(239,68,68,0.04)' } : {}}>
                                    <td className="highlight">{p.id}</td>
                                    <td style={{ color: 'var(--blue-bright)', fontWeight: 600 }}>{p.order}</td>
                                    <td>{p.agent}</td>
                                    <td>₹{p.expected}</td>
                                    <td>₹{p.collected}</td>
                                    <td style={{ color: diff === 0 ? 'var(--text-muted)' : Math.abs(diff) > 0 ? 'var(--red-primary)' : 'inherit', fontWeight: 700 }}>
                                        {diff === 0 ? '—' : diff > 0 ? `+₹${diff}` : `-₹${Math.abs(diff)}`}
                                    </td>
                                    <td><span className="badge badge-info">{MODE_ICONS[p.mode]} {p.mode}</span></td>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 12 }}>{p.date}</td>
                                    <td>
                                        {p.status === 'matched' && <span className="badge badge-success"><CheckCircle size={11} /> Matched</span>}
                                        {p.status === 'mismatch' && <span className="badge badge-danger"><AlertTriangle size={11} /> Mismatch</span>}
                                        {p.status === 'pending' && <span className="badge badge-warning"><Clock size={11} /> Pending</span>}
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No records found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
