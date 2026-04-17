import { useState } from 'react';
import { Search, Navigation, Wifi, WifiOff } from 'lucide-react';

const LOCATION_LOGS = [
    { id: 'LOC-001', agent: 'Ravi Kumar', lat: 12.9716, lng: 77.5946, accuracy: 12, time: '07:13:22', status: 'active', event: 'Delivery Stop', gps: 'strong' },
    { id: 'LOC-002', agent: 'Priya Sharma', lat: 13.0827, lng: 80.2707, accuracy: 8, time: '07:10:05', status: 'active', event: 'Route Update', gps: 'strong' },
    { id: 'LOC-003', agent: 'Ankit Mehta', lat: 18.5204, lng: 73.8567, accuracy: 24, time: '07:08:47', status: 'inactive', event: 'Last Known', gps: 'weak' },
    { id: 'LOC-004', agent: 'Leena Roy', lat: 12.2958, lng: 76.6394, accuracy: 15, time: '07:05:31', status: 'active', event: 'Geofence Enter', gps: 'strong' },
    { id: 'LOC-005', agent: 'Sunita Tiwari', lat: 13.3409, lng: 77.1093, accuracy: 10, time: '07:02:14', status: 'active', event: 'Route Update', gps: 'strong' },
    { id: 'LOC-006', agent: 'Deepak Nair', lat: 17.3850, lng: 78.4867, accuracy: 31, time: '06:59:00', status: 'inactive', event: 'Last Known', gps: 'offline' },
    { id: 'LOC-007', agent: 'Ravi Kumar', lat: 12.9352, lng: 77.6245, accuracy: 9, time: '06:56:11', status: 'active', event: 'Delivery Stop', gps: 'strong' },
    { id: 'LOC-008', agent: 'Priya Sharma', lat: 13.0604, lng: 80.2496, accuracy: 11, time: '06:52:45', status: 'active', event: 'Geofence Exit', gps: 'strong' },
];

const GPS_MAP: Record<string, any> = {
    strong: { cls: 'badge-success', icon: <Wifi size={11} />, label: 'Strong' },
    weak: { cls: 'badge-warning', icon: <Wifi size={11} />, label: 'Weak' },
    offline: { cls: 'badge-danger', icon: <WifiOff size={11} />, label: 'Offline' },
};

export default function LocationLogs() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const filtered = LOCATION_LOGS.filter(l => {
        const q = search.toLowerCase();
        const matchSearch = l.agent.toLowerCase().includes(q) || l.event.toLowerCase().includes(q) || l.id.toLowerCase().includes(q);
        const matchFilter = filter === 'all' || (filter === 'active' ? l.status === 'active' : l.status === 'inactive');
        return matchSearch && matchFilter;
    });

    const activeAgents = [...new Set(LOCATION_LOGS.filter(l => l.status === 'active').map(l => l.agent))].length;
    const inactiveAgents = [...new Set(LOCATION_LOGS.filter(l => l.status === 'inactive').map(l => l.agent))].length;

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">Location Logs</h1>
                <p className="page-subtitle">Real-time GPS tracking and last-known positions</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { label: 'Total Events', value: LOCATION_LOGS.length, color: 'var(--blue-bright)', bg: 'rgba(59,130,246,0.12)' },
                    { label: 'Active Agents', value: activeAgents, color: 'var(--green-primary)', bg: 'rgba(16,185,129,0.12)' },
                    { label: 'Offline Agents', value: inactiveAgents, color: 'var(--red-primary)', bg: 'rgba(239,68,68,0.12)' },
                    { label: 'Geofence Events', value: LOCATION_LOGS.filter(l => l.event.includes('Geofence')).length, color: 'var(--purple-primary)', bg: 'rgba(139,92,246,0.12)' },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-number" style={{ color: s.color, marginTop: 4 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Live Agents Panel */}
            <div style={{ marginBottom: 24 }}>
                <div className="section-title">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green-primary)', display: 'inline-block', boxShadow: '0 0 6px var(--green-primary)' }} />
                    Active Agents
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                    {LOCATION_LOGS.filter(l => l.status === 'active').slice(0, 4).map(l => (
                        <div key={l.id} className="card" style={{ padding: 16, borderColor: 'rgba(16,185,129,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{l.agent}</span>
                                <span className="badge badge-success" style={{ fontSize: 10 }}>● Live</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                                <Navigation size={12} color="var(--cyan-primary)" />
                                <span style={{ color: 'var(--cyan-primary)', fontFamily: 'monospace' }}>{l.lat.toFixed(4)}, {l.lng.toFixed(4)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                                <span>{l.event}</span>
                                <span style={{ fontFamily: 'monospace' }}>{l.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter + Table */}
            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search className="search-icon" />
                    <input className="search-input" placeholder="Search by agent or event..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {[['all', 'All'], ['active', 'Active'], ['inactive', 'Offline']].map(([f, label]) => (
                    <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>
                        {label}
                    </button>
                ))}
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Log ID</th><th>Agent</th><th>Latitude</th><th>Longitude</th><th>Accuracy</th><th>Event</th><th>Time</th><th>GPS Signal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(l => {
                            const { cls, icon, label } = GPS_MAP[l.gps];
                            return (
                                <tr key={l.id} style={l.status === 'inactive' ? { opacity: 0.7 } : {}}>
                                    <td className="highlight">{l.id}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{l.agent}</td>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--cyan-primary)' }}>{l.lat.toFixed(4)}</td>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--cyan-primary)' }}>{l.lng.toFixed(4)}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>±{l.accuracy}m</td>
                                    <td>{l.event}</td>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 12 }}>{l.time}</td>
                                    <td><span className={`badge ${cls}`}>{icon} {label}</span></td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No location data</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
