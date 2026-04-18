import { useState } from 'react';
import { Truck, Search, CheckCircle, Clock, AlertCircle, MapPin, User, Package } from 'lucide-react';

const DELIVERIES = [
    { id: 'DEL-2841', parcel: 'PKG-001', agent: 'Ravi Kumar', address: '12 MG Road, Bangalore', status: 'delivered', eta: '07:00', weight: '2.3 kg', payment: 'Paid' },
    { id: 'DEL-2842', parcel: 'PKG-002', agent: 'Priya Sharma', address: '45 Park St, Chennai', status: 'in-transit', eta: '08:30', weight: '0.8 kg', payment: 'COD' },
    { id: 'DEL-2843', parcel: 'PKG-003', agent: 'Ankit Mehta', address: '89 Station Rd, Pune', status: 'pending', eta: '09:15', weight: '4.1 kg', payment: 'UPI' },
    { id: 'DEL-2844', parcel: 'PKG-004', agent: 'Leena Roy', address: '3 Lal Bagh, Mysore', status: 'failed', eta: '07:45', weight: '1.5 kg', payment: 'Paid' },
    { id: 'DEL-2845', parcel: 'PKG-005', agent: 'Sunita Tiwari', address: '67 NH-48, Tumkur', status: 'in-transit', eta: '10:00', weight: '3.2 kg', payment: 'COD' },
    { id: 'DEL-2846', parcel: 'PKG-006', agent: 'Ravi Kumar', address: '21 Brigade Rd, Blr', status: 'pending', eta: '10:30', weight: '0.6 kg', payment: 'UPI' },
    { id: 'DEL-2847', parcel: 'PKG-007', agent: 'Deepak Nair', address: '5 Tech Park, Hyd', status: 'delivered', eta: '06:45', weight: '2.0 kg', payment: 'Paid' },
];

const STATUS_MAP: Record<string, any> = {
    delivered: { cls: 'badge-success', icon: <CheckCircle size={11} />, label: 'Delivered' },
    'in-transit': { cls: 'badge-info', icon: <Truck size={11} />, label: 'In Transit' },
    pending: { cls: 'badge-warning', icon: <Clock size={11} />, label: 'Pending' },
    failed: { cls: 'badge-danger', icon: <AlertCircle size={11} />, label: 'Failed' },
};

function StatusBadge({ status }: { status: string }) {
    const { cls, icon, label } = STATUS_MAP[status] || STATUS_MAP.pending;
    return <span className={`badge ${cls}`}>{icon} {label}</span>;
}

export default function DeliveryPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [deliveries, setDeliveries] = useState(DELIVERIES);

    const filtered = deliveries.filter(d => {
        const matchSearch = d.id.toLowerCase().includes(search.toLowerCase()) ||
            d.agent.toLowerCase().includes(search.toLowerCase()) ||
            d.parcel.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' || d.status === filter;
        return matchSearch && matchFilter;
    });

    const updateStatus = (id: string, newStatus: string) => {
        setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    };

    const counts: Record<string, number> = {
        all: deliveries.length,
        delivered: deliveries.filter(d => d.status === 'delivered').length,
        'in-transit': deliveries.filter(d => d.status === 'in-transit').length,
        pending: deliveries.filter(d => d.status === 'pending').length,
        failed: deliveries.filter(d => d.status === 'failed').length,
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">Deliveries</h1>
                <p className="page-subtitle">Manage and track all delivery assignments</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { label: 'Total', value: counts.all, color: 'var(--blue-bright)', bg: 'rgba(59,130,246,0.12)', icon: <Package size={20} /> },
                    { label: 'Delivered', value: counts.delivered, color: 'var(--green-primary)', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle size={20} /> },
                    { label: 'In Transit', value: counts['in-transit'], color: 'var(--cyan-primary)', bg: 'rgba(6,182,212,0.12)', icon: <Truck size={20} /> },
                    { label: 'Pending', value: counts.pending, color: 'var(--yellow-primary)', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={20} /> },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search className="search-icon" />
                    <input
                        className="search-input"
                        placeholder="Search by ID, agent, or parcel..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {['all', 'delivered', 'in-transit', 'pending', 'failed'].map(f => (
                    <button
                        key={f}
                        className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        <span style={{ marginLeft: 4, opacity: 0.7 }}>({counts[f] || 0})</span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Delivery ID</th>
                            <th>Parcel</th>
                            <th><User size={12} style={{ display: 'inline', marginRight: 4 }} />Agent</th>
                            <th><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Address</th>
                            <th>ETA</th>
                            <th>Weight</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(d => (
                            <tr key={d.id}>
                                <td className="highlight">{d.id}</td>
                                <td style={{ color: 'var(--blue-bright)', fontWeight: 600 }}>{d.parcel}</td>
                                <td>{d.agent}</td>
                                <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.address}</td>
                                <td style={{ fontFamily: 'monospace' }}>{d.eta}</td>
                                <td>{d.weight}</td>
                                <td><span className={`badge ${d.payment === 'Paid' ? 'badge-success' : d.payment === 'COD' ? 'badge-warning' : 'badge-info'}`}>{d.payment}</span></td>
                                <td><StatusBadge status={d.status} /></td>
                                <td>
                                    {d.status === 'in-transit' && (
                                        <button className="btn btn-sm btn-success" onClick={() => updateStatus(d.id, 'delivered')}>
                                            Mark Delivered
                                        </button>
                                    )}
                                    {d.status === 'pending' && (
                                        <button className="btn btn-sm btn-primary" onClick={() => updateStatus(d.id, 'in-transit')}>
                                            Dispatch
                                        </button>
                                    )}
                                    {(d.status === 'delivered' || d.status === 'failed') && (
                                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No deliveries found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
