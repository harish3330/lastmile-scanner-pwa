import { useState } from 'react';
import { CreditCard, DollarSign, AlertTriangle, CheckCircle, Clock, Smartphone, Banknote } from 'lucide-react';

const TRANSACTIONS = [
    { id: 'TXN-5001', order: 'DEL-2841', agent: 'Ravi Kumar', expected: 450, collected: 450, mode: 'UPI', status: 'matched', time: '07:02' },
    { id: 'TXN-5002', order: 'DEL-2842', agent: 'Priya Sharma', expected: 320, collected: 300, mode: 'Cash', status: 'mismatch', time: '07:08' },
    { id: 'TXN-5003', order: 'DEL-2843', agent: 'Ankit Mehta', expected: 870, collected: 870, mode: 'Card', status: 'matched', time: '07:15' },
    { id: 'TXN-5004', order: 'DEL-2845', agent: 'Sunita Tiwari', expected: 150, collected: 150, mode: 'UPI', status: 'matched', time: '07:22' },
    { id: 'TXN-5005', order: 'DEL-2847', agent: 'Deepak Nair', expected: 1200, collected: 1250, mode: 'Cash', status: 'mismatch', time: '07:30' },
    { id: 'TXN-5006', order: 'DEL-2849', agent: 'Ravi Kumar', expected: 560, collected: 560, mode: 'UPI', status: 'pending', time: '07:40' },
];

const MODE_ICONS: Record<string, React.ReactNode> = { UPI: <Smartphone size={13} />, Cash: <Banknote size={13} />, Card: <CreditCard size={13} /> };

export default function PaymentPage() {
    const [form, setForm] = useState({ orderId: '', amount: '', collected: '', mode: 'UPI', agent: '' });
    const [submitted, setSubmitted] = useState(false);
    const [txns, setTxns] = useState(TRANSACTIONS);

    const totalExpected = txns.reduce((a, t) => a + t.expected, 0);
    const totalCollected = txns.reduce((a, t) => a + t.collected, 0);
    const mismatches = txns.filter(t => t.status === 'mismatch').length;
    const pendingCount = txns.filter(t => t.status === 'pending').length;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const exp = Number(form.amount);
        const col = Number(form.collected);
        const newTxn = {
            id: `TXN-${5100 + txns.length}`,
            order: form.orderId || `DEL-${9000 + txns.length}`,
            agent: form.agent || 'Field Agent',
            expected: exp,
            collected: col,
            mode: form.mode,
            status: col === exp ? 'matched' : col > 0 ? 'mismatch' : 'pending',
            time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        };
        setTxns(prev => [newTxn, ...prev]);
        setSubmitted(true);
        setForm({ orderId: '', amount: '', collected: '', mode: 'UPI', agent: '' });
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">Payments</h1>
                <p className="page-subtitle">Cash collection, UPI, and mismatch detection</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { label: 'Total Expected', value: `₹${totalExpected.toLocaleString()}`, color: 'var(--blue-bright)', bg: 'rgba(59,130,246,0.12)', icon: <DollarSign size={20} /> },
                    { label: 'Total Collected', value: `₹${totalCollected.toLocaleString()}`, color: 'var(--green-primary)', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle size={20} /> },
                    { label: 'Mismatches', value: mismatches, color: 'var(--red-primary)', bg: 'rgba(239,68,68,0.12)', icon: <AlertTriangle size={20} /> },
                    { label: 'Pending', value: pendingCount, color: 'var(--yellow-primary)', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={20} /> },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-number" style={{ color: s.color, fontSize: typeof s.value === 'string' ? 22 : 26 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
                {/* Payment Form */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 4 }}>Record Payment</div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Log cash collection with mismatch detection</p>

                    {submitted && (
                        <div style={{
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                            borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13,
                            color: 'var(--green-primary)', display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <CheckCircle size={14} /> Payment recorded successfully!
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Order / Delivery ID</label>
                            <input className="form-input" placeholder="DEL-XXXX" value={form.orderId}
                                onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Agent Name</label>
                            <input className="form-input" placeholder="Agent name" value={form.agent}
                                onChange={e => setForm(f => ({ ...f, agent: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Expected Amount (₹)</label>
                            <input className="form-input" type="number" placeholder="0.00" value={form.amount}
                                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Collected Amount (₹)</label>
                            <input className="form-input" type="number" placeholder="0.00" value={form.collected}
                                onChange={e => setForm(f => ({ ...f, collected: e.target.value }))} required />
                        </div>

                        {form.amount && form.collected && Number(form.collected) !== Number(form.amount) && (
                            <div style={{
                                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                                borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13,
                                color: 'var(--red-primary)', display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                <AlertTriangle size={14} />
                                Mismatch: ₹{Math.abs(Number(form.amount) - Number(form.collected))} {Number(form.collected) < Number(form.amount) ? 'short' : 'excess'}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Payment Mode</label>
                            <select className="form-select" value={form.mode}
                                onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
                                <option value="UPI">UPI</option>
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            <CheckCircle size={15} /> Record Payment
                        </button>
                    </form>
                </div>

                {/* Transactions Table */}
                <div>
                    <div className="section-title">Transaction Log</div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Txn ID</th>
                                    <th>Order</th>
                                    <th>Agent</th>
                                    <th>Expected</th>
                                    <th>Collected</th>
                                    <th>Diff</th>
                                    <th>Mode</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {txns.map(t => {
                                    const diff = t.collected - t.expected;
                                    return (
                                        <tr key={t.id} style={t.status === 'mismatch' ? { background: 'rgba(239,68,68,0.04)' } : {}}>
                                            <td className="highlight">{t.id}</td>
                                            <td style={{ color: 'var(--blue-bright)', fontWeight: 600 }}>{t.order}</td>
                                            <td>{t.agent}</td>
                                            <td>₹{t.expected}</td>
                                            <td>₹{t.collected}</td>
                                            <td style={{ color: diff === 0 ? 'var(--text-muted)' : diff < 0 ? 'var(--red-primary)' : 'var(--yellow-primary)', fontWeight: 700 }}>
                                                {diff === 0 ? '—' : diff > 0 ? `+₹${diff}` : `-₹${Math.abs(diff)}`}
                                            </td>
                                            <td>
                                                <span className="badge badge-info" style={{ gap: 5 }}>
                                                    {MODE_ICONS[t.mode]} {t.mode}
                                                </span>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{t.time}</td>
                                            <td>
                                                {t.status === 'matched' && <span className="badge badge-success"><CheckCircle size={11} /> Matched</span>}
                                                {t.status === 'mismatch' && <span className="badge badge-danger"><AlertTriangle size={11} /> Mismatch</span>}
                                                {t.status === 'pending' && <span className="badge badge-warning"><Clock size={11} /> Pending</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
