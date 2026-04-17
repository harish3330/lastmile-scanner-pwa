import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Truck, CheckCircle, Clock, Search, AlertCircle } from 'lucide-react';

const DELIVERY_LOGS = [
    { id: 'LOG-001', parcel: 'PKG-001', agent: 'Ravi Kumar', event: 'Delivered', time: '2026-04-15 07:02', location: 'MG Road, Blr', status: 'delivered' },
    { id: 'LOG-002', parcel: 'PKG-002', agent: 'Priya Sharma', event: 'Dispatched', time: '2026-04-15 06:45', location: 'Depot, Blr', status: 'in-transit' },
    { id: 'LOG-003', parcel: 'PKG-003', agent: 'Ankit Mehta', event: 'Pickup', time: '2026-04-15 06:30', location: 'Warehouse A', status: 'pending' },
    { id: 'LOG-004', parcel: 'PKG-004', agent: 'Leena Roy', event: 'Failed', time: '2026-04-15 07:30', location: 'Lal Bagh, Mys', status: 'failed' },
    { id: 'LOG-005', parcel: 'PKG-005', agent: 'Sunita Tiwari', event: 'In Transit', time: '2026-04-15 07:00', location: 'NH-48', status: 'in-transit' },
    { id: 'LOG-006', parcel: 'PKG-006', agent: 'Ravi Kumar', event: 'Delivered', time: '2026-04-14 17:45', location: 'Brigade Rd, Blr', status: 'delivered' },
    { id: 'LOG-007', parcel: 'PKG-007', agent: 'Deepak Nair', event: 'Delivered', time: '2026-04-14 16:20', location: 'Tech Park, Hyd', status: 'delivered' },
    { id: 'LOG-008', parcel: 'PKG-008', agent: 'Ankit Mehta', event: 'Pending', time: '2026-04-14 15:00', location: 'Depot, Pune', status: 'pending' },
    { id: 'LOG-009', parcel: 'PKG-009', agent: 'Priya Sharma', event: 'Delivered', time: '2026-04-14 14:10', location: 'Anna Nagar, Ch', status: 'delivered' },
    { id: 'LOG-010', parcel: 'PKG-010', agent: 'Leena Roy', event: 'Failed', time: '2026-04-14 13:55', location: 'Godown, Mys', status: 'failed' },
];

const CHART_DATA = [
    { date: 'Apr 10', delivered: 42, failed: 3, pending: 8 },
    { date: 'Apr 11', delivered: 56, failed: 1, pending: 12 },
    { date: 'Apr 12', delivered: 48, failed: 5, pending: 6 },
    { date: 'Apr 13', delivered: 63, failed: 2, pending: 9 },
    { date: 'Apr 14', delivered: 71, failed: 4, pending: 7 },
    { date: 'Apr 15', delivered: 28, failed: 2, pending: 15 },
];

const STATUS_MAP: Record<string, any> = {
    delivered: { cls: 'badge-success', icon: <CheckCircle size={11} />, label: 'Delivered' },
    'in-transit': { cls: 'badge-info', icon: <Truck size={11} />, label: 'In Transit' },
    pending: { cls: 'badge-warning', icon: <Clock size={11} />, label: 'Pending' },
    failed: { cls: 'badge-danger', icon: <AlertCircle size={11} />, label: 'Failed' },
};

export default function DeliveryLogs() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const filtered = DELIVERY_LOGS.filter(l => {
        const q = search.toLowerCase();
        const matchSearch = l.id.toLowerCase().includes(q) || l.agent.toLowerCase().includes(q) || l.parcel.toLowerCase().includes(q);
        const matchFilter = filter === 'all' || l.status === filter;
        return matchSearch && matchFilter;
    });

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">Delivery Logs</h1>
                <p className="page-subtitle">Full history of all delivery events</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { label: 'Total Events', value: DELIVERY_LOGS.length, color: 'var(--blue-bright)', bg: 'rgba(59,130,246,0.12)' },
                    { label: 'Delivered', value: DELIVERY_LOGS.filter(l => l.status === 'delivered').length, color: 'var(--green-primary)', bg: 'rgba(16,185,129,0.12)' },
                    { label: 'In Transit', value: DELIVERY_LOGS.filter(l => l.status === 'in-transit').length, color: 'var(--cyan-primary)', bg: 'rgba(6,182,212,0.12)' },
                    { label: 'Failed', value: DELIVERY_LOGS.filter(l => l.status === 'failed').length, color: 'var(--red-primary)', bg: 'rgba(239,68,68,0.12)' },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-number" style={{ color: s.color, marginTop: 4 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-title" style={{ marginBottom: 18 }}>Deliveries — Last 6 Days</div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={CHART_DATA} barSize={14} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.8)" vertical={false} />
                        <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 8, color: '#f1f5f9' }}
                            cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                        />
                        <Bar dataKey="delivered" fill="#10b981" radius={[4, 4, 0, 0]} name="Delivered" />
                        <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Failed" />
                        <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Pending" />
                    </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 20, marginTop: 12, paddingLeft: 4 }}>
                    {[['#10b981', 'Delivered'], ['#ef4444', 'Failed'], ['#f59e0b', 'Pending']].map(([c, l]) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                            <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                            {l}
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters + Table */}
            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search className="search-icon" />
                    <input className="search-input" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {['all', 'delivered', 'in-transit', 'pending', 'failed'].map(f => (
                    <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
                    </button>
                ))}
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Log ID</th><th>Parcel</th><th>Agent</th><th>Event</th><th>Location</th><th>Timestamp</th><th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(l => {
                            const { cls, icon, label } = STATUS_MAP[l.status] || STATUS_MAP.pending;
                            return (
                                <tr key={l.id}>
                                    <td className="highlight">{l.id}</td>
                                    <td style={{ color: 'var(--blue-bright)', fontWeight: 600 }}>{l.parcel}</td>
                                    <td>{l.agent}</td>
                                    <td>{l.event}</td>
                                    <td>{l.location}</td>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 12 }}>{l.time}</td>
                                    <td><span className={`badge ${cls}`}>{icon} {label}</span></td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No logs found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
