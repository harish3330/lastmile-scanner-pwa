/**
 * @file pages/admin/dashboard.tsx
 * @owner Sahana-268 (Issue #2 — Frontend UI & Dashboard)
 *
 * DESIGN NOTE — Internal Tab Switcher (Intentional Pattern)
 * ---------------------------------------------------------
 * TEAM-ARCHITECTURE.md specifies these as separate pages:
 *   - pages/admin/deliveryLogs.tsx   → /admin/deliveryLogs
 *   - pages/admin/locationLogs.tsx   → /admin/locationLogs
 *   - pages/payments.tsx             → /payments
 *
 * This dashboard uses an **internal tab-switcher sidebar** instead of
 * navigating to those separate pages. This is an intentional UX decision:
 *   - Faster switching between views (no full page reload)
 *   - Unified admin experience in a single shell
 *   - The separate pages (deliveryLogs.tsx, locationLogs.tsx, payments.tsx)
 *     still exist and are individually accessible via direct URL or Navbar
 *
 * Tab mapping:
 *   | Tab label          | Data source / Architecture page       |
 *   |--------------------|---------------------------------------|
 *   | Delivery Logs      | pages/admin/deliveryLogs.tsx content  |
 *   | Location Logs      | pages/admin/locationLogs.tsx content  |
 *   | Payment Monitoring | pages/payments.tsx content            |
 *   | Analytics          | Chart summaries (dashboard-only view) |
 *
 * This does NOT violate Issue #2 scope — pages/components are owned by
 * Sahana-268 and no other module's code is modified.
 */

import React, { useState, useEffect } from 'react';
import { Agent, CashTransaction } from '@/lib/types/index';
import { DeliveryEvent, LocationEvent, PaymentEvent, AppEvent } from '@/lib/types/events';
import { eventBus } from '@/lib/events/eventBus';

import {

    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,

    PieChart, Pie, Cell, LineChart, Line, Legend

} from 'recharts';

import {

    ClipboardList, MapPin, DollarSign, BarChart2,

    CheckCircle, Clock, XCircle, AlertTriangle, Search,

    Wifi, WifiOff, Package, Truck, TrendingUp

} from 'lucide-react';



/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

   MOCK DATA

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const DELIVERY_LOGS: (Pick<DeliveryEvent, 'id' | 'agentId' | 'type' | 'timestamp'> & { parcelId?: string, parcel?: string, time?: string, agent: string, event: string, location: string, status: string })[] = [
    { id: 'LOG-001', parcelId: 'PKG-001', agentId: 'AG-001', agent: 'Ravi Kumar', event: 'Delivered', time: '2026-04-15 07:02', location: 'MG Road, Blr', status: 'delivered' } as any,
    { id: 'LOG-002', parcelId: 'PKG-002', agentId: 'AG-002', agent: 'Priya Sharma', event: 'Dispatched', time: '2026-04-15 06:45', location: 'Depot, Blr', status: 'in-transit' } as any,
    { id: 'LOG-003', parcelId: 'PKG-003', agentId: 'AG-003', agent: 'Ankit Mehta', event: 'Pickup', time: '2026-04-15 06:30', location: 'Warehouse A', status: 'pending' } as any,
    { id: 'LOG-004', parcelId: 'PKG-004', agentId: 'AG-004', agent: 'Leena Roy', event: 'Failed', time: '2026-04-15 07:30', location: 'Lal Bagh, Mys', status: 'failed' } as any,
    { id: 'LOG-005', parcelId: 'PKG-005', agentId: 'AG-005', agent: 'Sunita Tiwari', event: 'In Transit', time: '2026-04-15 07:00', location: 'NH-48', status: 'in-transit' } as any,
    { id: 'LOG-006', parcelId: 'PKG-006', agentId: 'AG-001', agent: 'Ravi Kumar', event: 'Delivered', time: '2026-04-14 17:45', location: 'Brigade Rd, Blr', status: 'delivered' } as any,
    { id: 'LOG-007', parcelId: 'PKG-007', agentId: 'AG-006', agent: 'Deepak Nair', event: 'Delivered', time: '2026-04-14 16:20', location: 'Tech Park, Hyd', status: 'delivered' } as any,
    { id: 'LOG-008', parcelId: 'PKG-008', agentId: 'AG-003', agent: 'Ankit Mehta', event: 'Pending', time: '2026-04-14 15:00', location: 'Depot, Pune', status: 'pending' } as any,
];





const PAYMENTS = [

    { id: 'PAY-001', order: 'DEL-2841', agent: 'Ravi Kumar', expected: 450, collected: 450, mode: 'UPI', status: 'matched', date: '07:02' },

    { id: 'PAY-002', order: 'DEL-2842', agent: 'Priya Sharma', expected: 320, collected: 300, mode: 'Cash', status: 'mismatch', date: '07:08' },

    { id: 'PAY-003', order: 'DEL-2843', agent: 'Ankit Mehta', expected: 870, collected: 870, mode: 'Card', status: 'matched', date: '07:15' },

    { id: 'PAY-004', order: 'DEL-2844', agent: 'Leena Roy', expected: 560, collected: 600, mode: 'Cash', status: 'mismatch', date: '07:20' },

    { id: 'PAY-005', order: 'DEL-2845', agent: 'Sunita Tiwari', expected: 150, collected: 150, mode: 'UPI', status: 'matched', date: '07:22' },

    { id: 'PAY-006', order: 'DEL-2846', agent: 'Deepak Nair', expected: 1200, collected: 0, mode: 'Cash', status: 'pending', date: '07:30' },

];



const CHART_DAILY = [

    { date: 'Apr 10', delivered: 42, failed: 3, pending: 8 },

    { date: 'Apr 11', delivered: 56, failed: 1, pending: 12 },

    { date: 'Apr 12', delivered: 48, failed: 5, pending: 6 },

    { date: 'Apr 13', delivered: 63, failed: 2, pending: 9 },

    { date: 'Apr 14', delivered: 71, failed: 4, pending: 7 },

    { date: 'Apr 15', delivered: 28, failed: 2, pending: 15 },

];



const PIE_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6'];



const TOOLTIP_STYLE = {

    contentStyle: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 },

    cursor: { fill: 'rgba(59,130,246,0.06)' },

};



/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

   SECTION: DELIVERY LOGS

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const AGENT_NAMES = ['Ravi Kumar', 'Priya Sharma', 'Ankit Mehta', 'Leena Roy', 'Sunita Tiwari'];

const AGENT_COLORS_MAP: Record<string, string> = {

    'Ravi Kumar': '#3b82f6',

    'Priya Sharma': '#10b981',

    'Ankit Mehta': '#8b5cf6',

    'Leena Roy': '#f59e0b',

    'Sunita Tiwari': '#06b6d4',

};



function DeliveryLogsSection() {
    const [logs, setLogs] = useState(DELIVERY_LOGS);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [agentFilter, setAgentFilter] = useState('all');

    useEffect(() => {
        const unsub = eventBus.subscribe<DeliveryEvent>('DELIVERY_EVENT', (event) => {
            const agentName = AGENT_NAMES.find(n => n.includes(event.agentId)) || 'Unknown Agent';
            const newLog = {
                id: event.id.substring(0, 8),
                parcel: event.payload.deliveryId,
                agent: agentName,
                event: event.payload.status.charAt(0).toUpperCase() + event.payload.status.slice(1).replace('_', ' '),
                time: new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                location: event.metadata.location ? `${event.metadata.location.lat.toFixed(2)}, ${event.metadata.location.lng.toFixed(2)}` : 'Remote',
                status: event.payload.status
            };
            setLogs(prev => [newLog as any, ...prev].slice(0, 50)); // Keep last 50
        });
        return unsub;
    }, []);

    const filtered = logs.filter(l => {
        const q = search.toLowerCase();
        return (l.id.toLowerCase().includes(q) || l.agent.toLowerCase().includes(q) || (l as any).parcel.toLowerCase().includes(q))
            && (filter === 'all' || l.status === filter)
            && (agentFilter === 'all' || l.agent === agentFilter);
    });

    const agentLogs = agentFilter === 'all' ? logs : logs.filter(l => l.agent === agentFilter);



    return (

        <div className="animate-in">

            <div className="page-header">

                <h1 className="page-title">Delivery Logs</h1>

                <p className="page-sub">Full history of all delivery events — filter by agent or status</p>

            </div>



            {/* Agent filter pills */}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>

                <button className={`btn btn-sm ${agentFilter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAgentFilter('all')}>All Agents</button>

                {AGENT_NAMES.map(name => (

                    <button key={name}

                        className={`btn btn-sm ${agentFilter === name ? 'btn-primary' : 'btn-outline'}`}

                        onClick={() => setAgentFilter(agentFilter === name ? 'all' : name)}

                        style={agentFilter === name ? { background: AGENT_COLORS_MAP[name], borderColor: AGENT_COLORS_MAP[name], color: 'white' } : {}}

                    >

                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: AGENT_COLORS_MAP[name], display: 'inline-block', marginRight: 5 }} />

                        {name.split(' ')[0]}

                    </button>

                ))}

            </div>



            {/* Live KPIs (update with agent filter) */}

            <div className="stats-grid" style={{ marginBottom: 20 }}>

                {[

                    { label: 'Total', v: agentLogs.length, color: 'var(--blue)', bg: 'var(--blue-bg)' },

                    { label: 'Delivered', v: agentLogs.filter(l => l.status === 'delivered').length, color: 'var(--green)', bg: 'var(--green-bg)' },

                    { label: 'In Transit', v: agentLogs.filter(l => l.status === 'in-transit').length, color: 'var(--cyan)', bg: 'rgba(6,182,212,0.12)' },

                    { label: 'Failed', v: agentLogs.filter(l => l.status === 'failed').length, color: 'var(--red)', bg: 'var(--red-bg)' },

                ].map(s => (

                    <div className="stat-card" key={s.label}>

                        <div className="stat-label">{s.label}</div>

                        <div className="stat-value" style={{ color: s.color, marginTop: 4 }}>{s.v}</div>

                    </div>

                ))}

            </div>



            {/* Bar Chart */}

            <div className="card" style={{ marginBottom: 22 }}>

                <div className="card-title">

                    Deliveries — Last 6 Days

                    {agentFilter !== 'all' && <span style={{ marginLeft: 10, fontSize: 12, color: AGENT_COLORS_MAP[agentFilter], fontWeight: 600 }}>({agentFilter})</span>}

                </div>

                <ResponsiveContainer width="100%" height={200}>

                    <BarChart data={CHART_DAILY} barSize={13} barGap={3}>

                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

                        <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />

                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />

                        <Tooltip {...TOOLTIP_STYLE} />

                        <Bar dataKey="delivered" fill="var(--green)" radius={[4, 4, 0, 0]} name="Delivered" />

                        <Bar dataKey="failed" fill="var(--red)" radius={[4, 4, 0, 0]} name="Failed" />

                        <Bar dataKey="pending" fill="var(--yellow)" radius={[4, 4, 0, 0]} name="Pending" />

                    </BarChart>

                </ResponsiveContainer>

                <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>

                    {[['var(--green)', 'Delivered'], ['var(--red)', 'Failed'], ['var(--yellow)', 'Pending']].map(([c, l]) => (

                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>

                            <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}

                        </div>

                    ))}

                </div>

            </div>



            <div className="filter-bar">

                <div className="search-wrap">

                    <Search className="search-icon" size={15} />

                    <input className="search-input" placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} />

                </div>

                {['all', 'delivered', 'in-transit', 'pending', 'failed'].map(f => (

                    <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>

                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}

                    </button>

                ))}

            </div>



            <div className="table-wrap">

                <table className="data-table">

                    <thead><tr><th>Log ID</th><th>Parcel</th><th>Agent</th><th>Event</th><th>Location</th><th>Timestamp</th><th>Status</th></tr></thead>

                    <tbody>

                        {filtered.map(l => (

                            <tr key={l.id}>

                                <td className="bold">{l.id}</td>

                                <td style={{ color: 'var(--blue)', fontWeight: 600 }}>{l.parcel}</td>

                                <td>{l.agent}</td>

                                <td>{l.event}</td>

                                <td>{l.location}</td>

                                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{l.time}</td>

                                <td>

                                    {l.status === 'delivered' && <span className="badge badge-green"><CheckCircle size={10} /> Delivered</span>}

                                    {l.status === 'in-transit' && <span className="badge badge-blue"><Truck size={10} /> In Transit</span>}

                                    {l.status === 'pending' && <span className="badge badge-yellow"><Clock size={10} /> Pending</span>}

                                    {l.status === 'failed' && <span className="badge badge-red"><XCircle size={10} /> Failed</span>}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}



/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

   SECTION: LOCATION LOGS — MULTI-AGENT

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */



// Extended location log data — 5 agents, multiple pings each

const LOCATION_LOGS = [

    { id: 'LOC-001', agent: 'Ravi Kumar', lat: 12.9716, lng: 77.5946, acc: 12, speed: 28, battery: 87, time: '07:13:22', event: 'Delivery Stop', gps: 'strong' },

    { id: 'LOC-002', agent: 'Ravi Kumar', lat: 12.9731, lng: 77.5963, acc: 9, speed: 35, battery: 85, time: '07:08:10', event: 'Route Update', gps: 'strong' },

    { id: 'LOC-003', agent: 'Priya Sharma', lat: 13.0827, lng: 80.2707, acc: 8, speed: 42, battery: 72, time: '07:10:05', event: 'Geofence Enter', gps: 'strong' },

    { id: 'LOC-004', agent: 'Priya Sharma', lat: 13.0835, lng: 80.2715, acc: 11, speed: 0, battery: 70, time: '07:05:15', event: 'Delivery Stop', gps: 'strong' },

    { id: 'LOC-005', agent: 'Ankit Mehta', lat: 18.5204, lng: 73.8567, acc: 24, speed: 18, battery: 54, time: '07:08:47', event: 'Route Update', gps: 'weak' },

    { id: 'LOC-006', agent: 'Ankit Mehta', lat: 18.5221, lng: 73.8580, acc: 30, speed: 22, battery: 52, time: '07:03:00', event: 'Last Known', gps: 'weak' },

    { id: 'LOC-007', agent: 'Leena Roy', lat: 12.2958, lng: 76.6394, acc: 15, speed: 55, battery: 91, time: '07:05:31', event: 'Geofence Exit', gps: 'strong' },

    { id: 'LOC-008', agent: 'Leena Roy', lat: 12.2975, lng: 76.6410, acc: 13, speed: 48, battery: 89, time: '07:00:00', event: 'Route Update', gps: 'strong' },

    { id: 'LOC-009', agent: 'Sunita Tiwari', lat: 13.3409, lng: 77.1093, acc: 10, speed: 31, battery: 65, time: '07:02:14', event: 'Delivery Stop', gps: 'strong' },

    { id: 'LOC-010', agent: 'Sunita Tiwari', lat: 13.3425, lng: 77.1108, acc: 12, speed: 27, battery: 63, time: '06:57:00', event: 'Route Update', gps: 'strong' },

    { id: 'LOC-011', agent: 'Deepak Nair', lat: 17.3850, lng: 78.4867, acc: 31, speed: 0, battery: 18, time: '06:59:00', event: 'Last Known', gps: 'offline' },

    { id: 'LOC-012', agent: 'Deepak Nair', lat: 17.3850, lng: 78.4867, acc: 31, speed: 0, battery: 16, time: '06:45:00', event: 'Signal Lost', gps: 'offline' },

];



// Per-agent summary cards data

const AGENT_LOCATION_SUMMARY = [

    { name: 'Ravi Kumar', initials: 'RK', color: '#3b82f6', status: 'active', pings: 12, lastEvent: 'Delivery Stop', lastSeen: '07:13', battery: 87, speed: 28, zone: 'MG Road, Blr' },

    { name: 'Priya Sharma', initials: 'PS', color: '#10b981', status: 'active', pings: 9, lastEvent: 'Geofence Enter', lastSeen: '07:10', battery: 72, speed: 42, zone: 'Anna Nagar, Chennai' },

    { name: 'Ankit Mehta', initials: 'AM', color: '#8b5cf6', status: 'weak', pings: 7, lastEvent: 'Route Update', lastSeen: '07:08', battery: 54, speed: 18, zone: 'Shivajinagar, Pune' },

    { name: 'Leena Roy', initials: 'LR', color: '#f59e0b', status: 'active', pings: 11, lastEvent: 'Geofence Exit', lastSeen: '07:05', battery: 91, speed: 55, zone: 'Lal Bagh, Mysore' },

    { name: 'Sunita Tiwari', initials: 'ST', color: '#06b6d4', status: 'active', pings: 8, lastEvent: 'Delivery Stop', lastSeen: '07:02', battery: 65, speed: 31, zone: 'NH-48, Tumkur' },

    { name: 'Deepak Nair', initials: 'DN', color: '#ef4444', status: 'offline', pings: 2, lastEvent: 'Signal Lost', lastSeen: '06:59', battery: 16, speed: 0, zone: 'Tech Park, Hyd' },

];



function LocationLogsSection() {
    const [logs, setLogs] = useState(LOCATION_LOGS);
    const [agentSummary, setAgentSummary] = useState(AGENT_LOCATION_SUMMARY);
    const [search, setSearch] = useState('');
    const [gpsFilter, setGpsFilter] = useState('all');
    const [agentFilter, setAgentFilter] = useState('all');

    useEffect(() => {
        const unsub = eventBus.subscribe<LocationEvent>('LOCATION_EVENT', (event) => {
            const agentName = AGENT_NAMES.find(n => n.includes(event.agentId)) || 'Unknown Agent';
            
            // 1. Update Logs Table
            const newLog = {
                id: `LOC-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
                agent: agentName,
                lat: event.payload.latitude,
                lng: event.payload.longitude,
                acc: event.payload.accuracy,
                speed: (event.payload as any).speed || 0,
                battery: (event.payload as any).battery || 100,
                time: new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                event: 'Live Update',
                gps: event.payload.accuracy < 15 ? 'strong' : 'weak'
            };
            setLogs(prev => [newLog as any, ...prev].slice(0, 50));

            // 2. Update Agent Summary Cards
            setAgentSummary(prev => prev.map(a => {
                if (a.name === agentName) {
                    return {
                        ...a,
                        status: 'active',
                        pings: (a.pings || 0) + 1,
                        lastSeen: new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        battery: (event.payload as any).battery || a.battery,
                        speed: (event.payload as any).speed || a.speed,
                        lastEvent: 'Live Update'
                    };
                }
                return a;
            }));
        });
        return unsub;
    }, []);

    const baseLogs = agentFilter === 'all' ? logs : logs.filter(l => l.agent === agentFilter);

    const filtered = baseLogs.filter(l => {
        const q = search.toLowerCase();
        return (l.agent.toLowerCase().includes(q) || l.event.toLowerCase().includes(q))
            && (gpsFilter === 'all' || l.gps === gpsFilter);
    });

    const currentAgentSummary = agentFilter === 'all' ? agentSummary : agentSummary.filter(a => a.name === agentFilter);
    const activeCount = agentSummary.filter(a => a.status === 'active').length;
    const offlineCount = agentSummary.filter(a => a.status === 'offline').length;
    const weakCount = agentSummary.filter(a => a.status === 'weak').length;
    const geofenceEvts = baseLogs.filter(l => l.event.includes('Geofence')).length;



    return (

        <div className="animate-in">

            <div className="page-header">

                <h1 className="page-title">Location Logs &mdash; Multi-Agent</h1>

                <p className="page-sub">Real-time GPS tracking across 5 delivery agents &middot; filter by agent or signal strength</p>

            </div>



            {/* Agent filter pills */}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>

                <button className={`btn btn-sm ${agentFilter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAgentFilter('all')}>All Agents</button>

                {agentSummary.map(a => (

                    <button key={a.name}

                        className={`btn btn-sm ${agentFilter === a.name ? 'btn-primary' : 'btn-outline'}`}

                        onClick={() => setAgentFilter(agentFilter === a.name ? 'all' : a.name)}

                        style={agentFilter === a.name ? { background: a.color, borderColor: a.color, color: 'white' } : {}}

                    >

                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: a.color, display: 'inline-block', marginRight: 5 }} />

                        {a.name.split(' ')[0]}

                        {a.status === 'offline' && <span style={{ marginLeft: 5, fontSize: 9, opacity: 0.8 }}>(!)</span>}

                    </button>

                ))}

            </div>



            {/* KPIs */}

            <div className="stats-grid" style={{ marginBottom: 20 }}>

                {[

                    { label: 'Log Events', v: baseLogs.length, color: 'var(--blue)', bg: 'var(--blue-bg)' },

                    { label: 'Active Agents', v: activeCount, color: 'var(--green)', bg: 'var(--green-bg)' },

                    { label: 'Weak Signal', v: weakCount, color: 'var(--yellow)', bg: 'var(--yellow-bg)' },

                    { label: 'Offline', v: offlineCount, color: 'var(--red)', bg: 'var(--red-bg)' },

                    { label: 'Geofence Evts', v: geofenceEvts, color: 'var(--purple)', bg: 'var(--purple-bg)' },

                ].map(s => (

                    <div className="stat-card" key={s.label}>

                        <div className="stat-label">{s.label}</div>

                        <div className="stat-value" style={{ color: s.color, marginTop: 4 }}>{s.v}</div>

                    </div>

                ))}

            </div>



            {/* Agent Summary Cards */}

            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>

                <span className="status-dot dot-green" /> Agent Live Status

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 12, marginBottom: 22 }}>

                {currentAgentSummary.map(a => (

                    <div key={a.name} className="card" onClick={() => setAgentFilter(agentFilter === a.name ? 'all' : a.name)}

                        style={{

                            padding: 14, cursor: 'pointer', transition: 'all 0.2s',

                            borderColor: agentFilter === a.name ? a.color : a.status === 'offline' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.2)',

                            borderWidth: agentFilter === a.name ? 2 : 1,

                            opacity: agentFilter !== 'all' && agentFilter !== a.name ? 0.4 : 1,

                        }}>

                        {/* Header */}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0 }}>{a.initials}</div>

                                <div>

                                    <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>{a.name}</div>

                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.pings} pings</div>

                                </div>

                            </div>

                            <span className={`badge ${a.status === 'active' ? 'badge-green' : a.status === 'weak' ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: 9 }}>

                                {a.status === 'active' ? <><Wifi size={8} /> Live</> : a.status === 'weak' ? <><Wifi size={8} /> Weak</> : <><WifiOff size={8} /> Offline</>}

                            </span>

                        </div>



                        {/* GPS coords placeholder */}

                        <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--cyan)', marginBottom: 8, opacity: a.status === 'offline' ? 0.5 : 1 }}>

                            {LOCATION_LOGS.filter(l => l.agent === a.name)[0]?.lat.toFixed(4)}, {LOCATION_LOGS.filter(l => l.agent === a.name)[0]?.lng.toFixed(4)}

                        </div>



                        {/* Stats row */}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>

                            {[

                                { label: 'Speed', val: `${a.speed}km/h` },

                                { label: 'Battery', val: `${a.battery}%` },

                                { label: 'Last', val: a.lastSeen },

                            ].map(s => (

                                <div key={s.label} style={{ background: 'var(--bg-app)', borderRadius: 6, padding: '5px 4px', textAlign: 'center' }}>

                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.label}</div>

                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{s.val}</div>

                                </div>

                            ))}

                        </div>



                        {/* Battery bar */}

                        <div>

                            <div className="progress-wrap">

                                <div className="progress-fill" style={{

                                    width: `${a.battery}%`,

                                    background: a.battery > 60 ? 'var(--green)' : a.battery > 30 ? 'var(--yellow)' : 'var(--red)',

                                }} />

                            </div>

                        </div>



                        <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>

                            <MapPin size={9} style={{ display: 'inline', marginRight: 3 }} />{a.zone}

                        </div>

                    </div>

                ))}

            </div>



            {/* Filter bar */}

            <div className="filter-bar">

                <div className="search-wrap">

                    <Search className="search-icon" size={15} />

                    <input className="search-input" placeholder="Search by agent or event..." value={search} onChange={e => setSearch(e.target.value)} />

                </div>

                {[['all', 'All'], ['strong', 'Strong GPS'], ['weak', 'Weak GPS'], ['offline', 'Offline']].map(([f, lbl]) => (

                    <button key={f} className={`btn btn-sm ${gpsFilter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setGpsFilter(f)}>{lbl}</button>

                ))}

            </div>



            {/* Logs table */}

            <div className="table-wrap">

                <table className="data-table">

                    <thead>

                        <tr><th>Log ID</th><th>Agent</th><th>Latitude</th><th>Longitude</th><th>Acc.</th><th>Speed</th><th>Battery</th><th>Event</th><th>Time</th><th>GPS</th></tr>

                    </thead>

                    <tbody>

                        {filtered.map(l => {

                            const agentInfo = agentSummary.find(a => a.name === l.agent);

                            return (

                                <tr key={l.id} style={l.gps === 'offline' ? { opacity: 0.6 } : {}}>

                                    <td className="bold">{l.id}</td>

                                    <td>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>

                                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: agentInfo?.color || 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'white', flexShrink: 0 }}>

                                                {agentInfo?.initials}

                                            </div>

                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{l.agent}</span>

                                        </div>

                                    </td>

                                    <td style={{ fontFamily: 'monospace', color: 'var(--cyan)', fontSize: 12 }}>{l.lat.toFixed(4)}</td>

                                    <td style={{ fontFamily: 'monospace', color: 'var(--cyan)', fontSize: 12 }}>{l.lng.toFixed(4)}</td>

                                    <td style={{ color: 'var(--text-muted)' }}>&plusmn;{l.acc}m</td>

                                    <td style={{ fontWeight: 600 }}>{l.speed > 0 ? `${l.speed} km/h` : <span style={{ color: 'var(--text-muted)' }}>Stopped</span>}</td>

                                    <td>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>

                                            <div className="progress-wrap" style={{ width: 40 }}>

                                                <div className="progress-fill" style={{ width: `${l.battery}%`, background: l.battery > 60 ? 'var(--green)' : l.battery > 30 ? 'var(--yellow)' : 'var(--red)' }} />

                                            </div>

                                            <span style={{ fontSize: 11, color: l.battery < 30 ? 'var(--red)' : 'var(--text-muted)' }}>{l.battery}%</span>

                                        </div>

                                    </td>

                                    <td>{l.event}</td>

                                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{l.time}</td>

                                    <td>

                                        {l.gps === 'strong' && <span className="badge badge-green"><Wifi size={9} /> Strong</span>}

                                        {l.gps === 'weak' && <span className="badge badge-yellow"><Wifi size={9} /> Weak</span>}

                                        {l.gps === 'offline' && <span className="badge badge-red"><WifiOff size={9} /> Offline</span>}

                                    </td>

                                </tr>

                            );

                        })}

                    </tbody>

                </table>

            </div>

        </div>

    );

}







/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

   SECTION: PAYMENT MONITORING

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function PaymentMonitorSection() {
    const [payments, setPayments] = useState(PAYMENTS);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [agentFilter, setAgentFilter] = useState('all');

    useEffect(() => {
        const unsub = eventBus.subscribe<PaymentEvent>('PAYMENT_EVENT', (event) => {
            const agentName = AGENT_NAMES.find(n => n.includes(event.agentId)) || 'Unknown Agent';
            const newPayment = {
                id: event.payload.transactionId,
                order: `DEL-${Math.floor(Math.random() * 9000) + 1000}`,
                agent: agentName,
                expected: event.payload.expectedAmount,
                collected: event.payload.collectedAmount,
                mode: event.payload.paymentMode.charAt(0).toUpperCase() + event.payload.paymentMode.slice(1),
                status: event.payload.status,
                date: new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setPayments(prev => [newPayment as any, ...prev].slice(0, 50));
        });
        return unsub;
    }, []);

    const agentPayments = agentFilter === 'all' ? payments : payments.filter(p => p.agent === agentFilter);
    const totalExp = agentPayments.reduce((a, p) => a + p.expected, 0);
    const totalCol = agentPayments.reduce((a, p) => a + p.collected, 0);
    const mismatches = agentPayments.filter(p => p.status === 'mismatch').length;

    const modeData = [
        { name: 'UPI', value: agentPayments.filter(p => p.mode === 'UPI').length },
        { name: 'Cash', value: agentPayments.filter(p => p.mode === 'Cash').length },
        { name: 'Card', value: agentPayments.filter(p => p.mode === 'Card').length },
    ];

    const filtered = agentPayments.filter(p => {
        const q = search.toLowerCase();
        return (p.id.toLowerCase().includes(q) || p.agent.toLowerCase().includes(q) || (p as any).order.toLowerCase().includes(q))
            && (filter === 'all' || p.status === filter);
    });



    return (

        <div className="animate-in">

            <div className="page-header">

                <h1 className="page-title">Payment Monitoring</h1>

                <p className="page-sub">Transaction overview, mode breakdown, and cash mismatch detection — filter by agent</p>

            </div>



            {/* Agent filter pills */}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>

                <button className={`btn btn-sm ${agentFilter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setAgentFilter('all')}>All Agents</button>

                {AGENT_NAMES.map(name => (

                    <button key={name}

                        className={`btn btn-sm ${agentFilter === name ? 'btn-primary' : 'btn-outline'}`}

                        style={agentFilter === name ? { background: (AGENT_COLORS_MAP as any)[name], borderColor: (AGENT_COLORS_MAP as any)[name], color: 'white' } : {}}

                    >

                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: (AGENT_COLORS_MAP as any)[name], display: 'inline-block', marginRight: 5 }} />

                        {name.split(' ')[0]}

                    </button>

                ))}

            </div>



            <div className="stats-grid">

                {[

                    { label: 'Total Expected', v: `₹${totalExp.toLocaleString()}`, color: 'var(--blue)', bg: 'var(--blue-bg)' },

                    { label: 'Total Collected', v: `₹${totalCol.toLocaleString()}`, color: 'var(--green)', bg: 'var(--green-bg)' },

                    { label: 'Mismatches', v: mismatches, color: 'var(--red)', bg: 'var(--red-bg)' },

                    { label: 'Variance', v: `₹${Math.abs(totalExp - totalCol)}`, color: 'var(--yellow)', bg: 'var(--yellow-bg)' },

                ].map(s => (

                    <div className="stat-card" key={s.label}>

                        <div className="stat-label">{s.label}</div>

                        <div className="stat-value" style={{ color: s.color, fontSize: typeof s.v === 'string' && s.v.includes('₹') ? 18 : 24, marginTop: 4 }}>{s.v}</div>

                    </div>

                ))}

            </div>



            <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, marginBottom: 22 }}>

                {/* Settlement summary */}

                <div className="card">

                    <div className="card-title">Settlement Summary</div>

                    {[

                        { label: 'Matched', v: PAYMENTS.filter(p => p.status === 'matched').length, total: PAYMENTS.length, c: 'var(--green)' },

                        { label: 'Mismatch', v: PAYMENTS.filter(p => p.status === 'mismatch').length, total: PAYMENTS.length, c: 'var(--red)' },

                        { label: 'Pending', v: PAYMENTS.filter(p => p.status === 'pending').length, total: PAYMENTS.length, c: 'var(--yellow)' },

                    ].map(s => (

                        <div key={s.label} style={{ marginBottom: 14 }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>

                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>

                                <span style={{ fontSize: 13, fontWeight: 700, color: s.c }}>{s.v} / {s.total}</span>

                            </div>

                            <div className="progress-wrap">

                                <div className="progress-fill" style={{ width: `${(s.v / s.total) * 100}%`, background: s.c }} />

                            </div>

                        </div>

                    ))}

                    {mismatches > 0 && (

                        <div className="alert alert-danger" style={{ fontSize: 12, marginTop: 8 }}>

                            <AlertTriangle size={14} />

                            {mismatches} mismatch(es) — variance ₹{Math.abs(totalExp - totalCol)} needs review

                        </div>

                    )}

                </div>



                {/* Pie Chart */}

                <div className="card" style={{ textAlign: 'center' }}>

                    <div className="card-title">Payment Modes</div>

                    <ResponsiveContainer width="100%" height={150}>

                        <PieChart>

                            <Pie data={modeData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} dataKey="value" paddingAngle={4}>

                                {modeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}

                            </Pie>

                            <Tooltip {...TOOLTIP_STYLE} />

                        </PieChart>

                    </ResponsiveContainer>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6 }}>

                        {modeData.map((d, i) => (

                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>

                                <div style={{ width: 7, height: 7, borderRadius: 2, background: PIE_COLORS[i] }} />

                                {d.name} ({d.value})

                            </div>

                        ))}

                    </div>

                </div>

            </div>



            <div className="filter-bar">

                <div className="search-wrap">

                    <Search className="search-icon" size={15} />

                    <input className="search-input" placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)} />

                </div>

                {[['all', 'All'], ['matched', 'Matched'], ['mismatch', 'Mismatch'], ['pending', 'Pending']].map(([f, l]) => (

                    <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)}>{l}</button>

                ))}

            </div>



            <div className="table-wrap">

                <table className="data-table">

                    <thead><tr><th>Pay ID</th><th>Order</th><th>Agent</th><th>Expected</th><th>Collected</th><th>Variance</th><th>Mode</th><th>Time</th><th>Status</th></tr></thead>

                    <tbody>

                        {filtered.map(p => {

                            const diff = p.collected - p.expected;

                            return (

                                <tr key={p.id} style={p.status === 'mismatch' ? { background: 'rgba(239,68,68,0.04)' } : {}}>

                                    <td className="bold">{p.id}</td>

                                    <td style={{ color: 'var(--blue)', fontWeight: 600 }}>{p.order}</td>

                                    <td>{p.agent}</td>

                                    <td>₹{p.expected}</td>

                                    <td>₹{p.collected}</td>

                                    <td style={{ color: diff === 0 ? 'var(--text-muted)' : diff < 0 ? 'var(--red)' : 'var(--yellow)', fontWeight: 700 }}>

                                        {diff === 0 ? '—' : diff > 0 ? `+₹${diff}` : `-₹${Math.abs(diff)}`}

                                    </td>

                                    <td><span className="badge badge-blue">{p.mode}</span></td>

                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.date}</td>

                                    <td>

                                        {p.status === 'matched' && <span className="badge badge-green"><CheckCircle size={10} /> Matched</span>}

                                        {p.status === 'mismatch' && <span className="badge badge-red"><AlertTriangle size={10} /> Mismatch</span>}

                                        {p.status === 'pending' && <span className="badge badge-yellow"><Clock size={10} /> Pending</span>}

                                    </td>

                                </tr>

                            );

                        })}

                    </tbody>

                </table>

            </div>

        </div>

    );

}



/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

   SECTION: ANALYTICS — MULTI-AGENT

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */



const AGENTS = [

    { name: 'Ravi Kumar', initials: 'RK', color: '#3b82f6', assigned: 88, delivered: 71, failed: 4, pending: 7, cod: 4820, mismatches: 0, rating: 4.9 },

    { name: 'Priya Sharma', initials: 'PS', color: '#10b981', assigned: 80, delivered: 58, failed: 6, pending: 11, cod: 3960, mismatches: 1, rating: 4.6 },

    { name: 'Ankit Mehta', initials: 'AM', color: '#8b5cf6', assigned: 78, delivered: 63, failed: 3, pending: 9, cod: 5100, mismatches: 0, rating: 4.8 },

    { name: 'Leena Roy', initials: 'LR', color: '#f59e0b', assigned: 72, delivered: 44, failed: 9, pending: 13, cod: 2870, mismatches: 2, rating: 4.1 },

    { name: 'Sunita Tiwari', initials: 'ST', color: '#06b6d4', assigned: 68, delivered: 52, failed: 5, pending: 8, cod: 3450, mismatches: 1, rating: 4.4 },

];



const AGENT_DAILY = [

    { date: 'Apr 10', Ravi: 12, Priya: 9, Ankit: 11, Leena: 7, Sunita: 8 },

    { date: 'Apr 11', Ravi: 15, Priya: 11, Ankit: 13, Leena: 8, Sunita: 10 },

    { date: 'Apr 12', Ravi: 11, Priya: 10, Ankit: 12, Leena: 6, Sunita: 9 },

    { date: 'Apr 13', Ravi: 14, Priya: 13, Ankit: 14, Leena: 9, Sunita: 11 },

    { date: 'Apr 14', Ravi: 16, Priya: 12, Ankit: 10, Leena: 8, Sunita: 8 },

    { date: 'Apr 15', Ravi: 3, Priya: 3, Ankit: 3, Leena: 6, Sunita: 6 },

];



const TREND_DATA = [

    { date: 'Apr 10', dispatched: 47, delivered: 39, payments: 42 },

    { date: 'Apr 11', dispatched: 57, delivered: 47, payments: 52 },

    { date: 'Apr 12', dispatched: 48, delivered: 40, payments: 45 },

    { date: 'Apr 13', dispatched: 61, delivered: 51, payments: 57 },

    { date: 'Apr 14', dispatched: 54, delivered: 46, payments: 50 },

    { date: 'Apr 15', dispatched: 21, delivered: 16, payments: 19 },

];



function AnalyticsSection() {
    const [agentPerformance, setAgentPerformance] = useState(AGENTS);
    const [selectedAgent, setSelectedAgent] = useState('all');

    useEffect(() => {
        const unsubDelivery = eventBus.subscribe<DeliveryEvent>('DELIVERY_EVENT', (event) => {
            const agentName = AGENT_NAMES.find(n => n.includes(event.agentId)) || 'Unknown Agent';
            setAgentPerformance(prev => prev.map(a => {
                if (a.name === agentName) {
                    const status = event.payload.status;
                    return {
                        ...a,
                        delivered: status === 'completed' ? a.delivered + 1 : a.delivered,
                        failed: (status as any) === 'failed' ? a.failed + 1 : a.failed,
                        pending: status === 'started' || status === 'in_progress' ? a.pending + 1 : a.pending - (status === 'completed' || (status as any) === 'failed' ? 1 : 0)
                    };
                }
                return a;
            }));
        });

        const unsubPayment = eventBus.subscribe<PaymentEvent>('PAYMENT_EVENT', (event) => {
            const agentName = AGENT_NAMES.find(n => n.includes(event.agentId)) || 'Unknown Agent';
            setAgentPerformance(prev => prev.map(a => {
                if (a.name === agentName) {
                    return {
                        ...a,
                        cod: a.cod + (event.payload.collectedAmount || 0),
                        mismatches: event.payload.status === 'mismatch' ? a.mismatches + 1 : a.mismatches
                    };
                }
                return a;
            }));
        });

        return () => {
            unsubDelivery();
            unsubPayment();
        };
    }, []);

    const focused = selectedAgent === 'all' ? agentPerformance : agentPerformance.filter(a => a.name === selectedAgent);
    const totalAssigned = focused.reduce((s, a) => s + a.assigned, 0);
    const totalDel = focused.reduce((s, a) => s + a.delivered, 0);
    const totalFail = focused.reduce((s, a) => s + a.failed, 0);
    const totalPend = focused.reduce((s, a) => s + a.pending, 0);
    const totalCOD = focused.reduce((s, a) => s + a.cod, 0);
    const avgRate = (focused.reduce((s, a) => s + a.rating, 0) / focused.length).toFixed(1);
    const completionPct = Math.round((totalDel / (totalAssigned || 1)) * 100);
    const successPct = Math.round((totalDel / ((totalDel + totalFail) || 1)) * 100);
    const ranked = [...agentPerformance].sort((a, b) => b.delivered - a.delivered);



    return (

        <div className="animate-in">

            <div className="page-header">

                <h1 className="page-title">Analytics — Multi-Agent</h1>

                <p className="page-sub">Performance tracking across 5 delivery agents · assigned vs delivered visibility</p>

            </div>



            {/* Agent filter pills */}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>

                <button className={`btn btn-sm ${selectedAgent === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSelectedAgent('all')}>All Agents</button>

                {agentPerformance.map(a => (

                    <button key={a.name}

                        className={`btn btn-sm ${selectedAgent === a.name ? 'btn-primary' : 'btn-outline'}`}

                        onClick={() => setSelectedAgent(selectedAgent === a.name ? 'all' : a.name)}

                        style={selectedAgent === a.name ? { background: a.color, borderColor: a.color, color: 'white' } : {}}

                    >

                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: a.color, display: 'inline-block', marginRight: 5 }} />

                        {a.name.split(' ')[0]}

                    </button>

                ))}

            </div>



            {/* KPI Row */}

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', marginBottom: 22 }}>

                {[

                    { label: 'Assigned', v: totalAssigned, color: 'var(--blue)', bg: 'var(--blue-bg)', icon: <Package size={16} /> },

                    { label: 'Delivered', v: `${totalDel} / ${totalAssigned}`, color: 'var(--green)', bg: 'var(--green-bg)', icon: <CheckCircle size={16} /> },

                    { label: 'Failed', v: totalFail, color: 'var(--red)', bg: 'var(--red-bg)', icon: <XCircle size={16} /> },

                    { label: 'Pending', v: totalPend, color: 'var(--yellow)', bg: 'var(--yellow-bg)', icon: <Clock size={16} /> },

                    { label: 'Completion', v: `${completionPct}%`, color: 'var(--cyan)', bg: 'rgba(6,182,212,0.12)', icon: <TrendingUp size={16} /> },

                    { label: 'Success Rate', v: `${successPct}%`, color: 'var(--purple)', bg: 'var(--purple-bg)', icon: <TrendingUp size={16} /> },

                    { label: 'COD Total', v: `₹${totalCOD.toLocaleString()}`, color: 'var(--blue)', bg: 'var(--blue-bg)', icon: <Package size={16} /> },

                    { label: 'Avg Rating', v: `${avgRate}★`, color: 'var(--yellow)', bg: 'var(--yellow-bg)', icon: <TrendingUp size={16} /> },

                ].map(s => (

                    <div className="stat-card" key={s.label}>

                        <div className="stat-icon" style={{ background: s.bg, color: s.color, width: 32, height: 32, borderRadius: 9 }}>{s.icon}</div>

                        <div className="stat-label" style={{ marginTop: 8 }}>{s.label}</div>

                        <div className="stat-value" style={{ color: s.color, fontSize: typeof s.v === 'string' ? 15 : 24 }}>{s.v}</div>

                    </div>

                ))}

            </div>



            {/* Agent Performance Cards */}

            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Agent Performance Cards</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12, marginBottom: 22 }}>

                {agentPerformance.map((a) => {

                    const deliveryPct = Math.round((a.delivered / a.assigned) * 100);

                    const successPctCard = Math.round((a.delivered / ((a.delivered + a.failed) || 1)) * 100);

                    const isFocus = selectedAgent === 'all' || selectedAgent === a.name;

                    return (

                        <div key={a.name} className="card" onClick={() => setSelectedAgent(selectedAgent === a.name ? 'all' : a.name)}

                            style={{

                                cursor: 'pointer', opacity: isFocus ? 1 : 0.4, transition: 'all 0.2s',

                                borderColor: selectedAgent === a.name ? a.color : 'var(--border)',

                                borderWidth: selectedAgent === a.name ? 2 : 1

                            }}>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>

                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>{a.initials}</div>

                                <div>

                                    <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>{a.name}</div>

                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.rating}★</div>

                                </div>

                            </div>



                            {/* Assigned vs Delivered bar */}

                            <div style={{ marginBottom: 8 }}>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>

                                    <span>Delivered / Assigned</span>

                                    <span style={{ color: a.color, fontWeight: 700 }}>{a.delivered} / {a.assigned}</span>

                                </div>

                                <div style={{ height: 6, borderRadius: 4, background: 'var(--border)', position: 'relative', overflow: 'hidden' }}>

                                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${deliveryPct}%`, background: a.color, borderRadius: 4, transition: 'width 0.4s' }} />

                                </div>

                                <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>{deliveryPct}% of assigned · {successPctCard}% success rate</div>

                            </div>



                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 3, textAlign: 'center' }}>

                                {[
                                    ['📦', a.assigned, '#94a3b8', 'Asgnd'] as const,
                                    ['✓', a.delivered, 'var(--green)', 'Done'] as const,
                                    ['✗', a.failed, 'var(--red)', 'Fail'] as const,
                                    ['...', a.pending, 'var(--yellow)', 'Pend'] as const,
                                ].map(([_sym, val, c, lbl]) => (

                                    <div key={lbl} style={{ background: 'var(--bg-app)', borderRadius: 6, padding: '4px 2px' }}>

                                        <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{lbl}</div>

                                        <div style={{ fontSize: 13, fontWeight: 700, color: c }}>{val}</div>

                                    </div>

                                ))}

                            </div>

                            {a.mismatches > 0 && <div style={{ marginTop: 7, fontSize: 11, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={10} />{a.mismatches} mismatch{a.mismatches > 1 ? 'es' : ''}</div>}

                        </div>

                    );

                })}

            </div>



            {/* Charts row */}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>

                <div className="card">

                    <div className="card-title">Daily Deliveries by Agent</div>

                    <ResponsiveContainer width="100%" height={210}>

                        <BarChart data={AGENT_DAILY} barSize={6} barGap={1}>

                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

                            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />

                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />

                            <Tooltip {...TOOLTIP_STYLE} />

                            <Legend wrapperStyle={{ fontSize: 10 }} />

                            {agentPerformance.map(a => (

                                <Bar key={a.name} dataKey={a.name.split(' ')[0]} fill={a.color} radius={[3, 3, 0, 0]} name={a.name.split(' ')[0]}

                                    hide={selectedAgent !== 'all' && selectedAgent !== a.name} />

                            ))}

                        </BarChart>

                    </ResponsiveContainer>

                </div>

                <div className="card">

                    <div className="card-title">6-Day Fleet Trend</div>

                    <ResponsiveContainer width="100%" height={210}>

                        <LineChart data={TREND_DATA} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>

                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />

                            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />

                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />

                            <Tooltip {...TOOLTIP_STYLE} />

                            <Legend wrapperStyle={{ fontSize: 10 }} />

                            <Line type="monotone" dataKey="dispatched" stroke="var(--blue)" strokeWidth={2} dot={{ r: 2 }} name="Dispatched" />

                            <Line type="monotone" dataKey="delivered" stroke="var(--green)" strokeWidth={2} dot={{ r: 2 }} name="Delivered" />

                            <Line type="monotone" dataKey="payments" stroke="var(--purple)" strokeWidth={2} dot={{ r: 2 }} name="Payments OK" />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </div>



            {/* Leaderboard */}

            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>🏆 Agent Leaderboard</div>

            <div className="table-wrap">

                <table className="data-table">

                    <thead>

                        <tr>

                            <th>Rank</th><th>Agent</th><th>Assigned</th><th>Delivered / Assigned</th>

                            <th>Failed</th><th>Pending</th><th>Success Rate</th>

                            <th>COD Collected</th><th>Mismatches</th><th>Rating</th>

                        </tr>

                    </thead>

                    <tbody>

                        {ranked.map((a, i) => {

                            const compRate = Math.round((a.delivered / a.assigned) * 100);

                            const succRate = Math.round((a.delivered / ((a.delivered + a.failed) || 1)) * 100);

                            return (

                                <tr key={a.name} style={i === 0 ? { background: 'rgba(16,185,129,0.04)' } : {}}>

                                    <td>

                                        <span style={{

                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', fontSize: 12, fontWeight: 800,

                                            background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7c3f' : 'var(--bg-app)',

                                            color: i < 3 ? 'white' : 'var(--text-muted)'

                                        }}>{i + 1}</span>

                                    </td>

                                    <td>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: a.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white' }}>{a.initials}</div>

                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</span>

                                            {i === 0 && <span className="badge badge-green" style={{ fontSize: 9 }}>Top Agent</span>}

                                        </div>

                                    </td>

                                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{a.assigned}</td>

                                    <td>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                                            <div style={{ height: 6, flex: 1, minWidth: 50, borderRadius: 4, background: 'var(--border)', position: 'relative', overflow: 'hidden' }}>

                                                <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${compRate}%`, background: a.color, borderRadius: 4 }} />

                                            </div>

                                            <span style={{ fontSize: 12, fontWeight: 700, color: a.color, whiteSpace: 'nowrap' }}>{a.delivered}/{a.assigned} ({compRate}%)</span>

                                        </div>

                                    </td>

                                    <td style={{ color: 'var(--red)', fontWeight: 600 }}>{a.failed}</td>

                                    <td style={{ color: 'var(--yellow)', fontWeight: 600 }}>{a.pending}</td>

                                    <td>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                                            <div className="progress-wrap" style={{ flex: 1, minWidth: 40 }}><div className="progress-fill" style={{ width: `${succRate}%`, background: a.color }} /></div>

                                            <span style={{ fontSize: 12, fontWeight: 700, color: a.color }}>{succRate}%</span>

                                        </div>

                                    </td>

                                    <td style={{ fontWeight: 600 }}>₹{a.cod.toLocaleString()}</td>

                                    <td>{a.mismatches === 0 ? <span className="badge badge-green"><CheckCircle size={9} /> None</span> : <span className="badge badge-red"><AlertTriangle size={9} /> {a.mismatches}</span>}</td>

                                    <td><span style={{ fontWeight: 700, color: a.rating >= 4.7 ? 'var(--green)' : a.rating >= 4.3 ? 'var(--yellow)' : 'var(--red)' }}>{a.rating} ★</span></td>

                                </tr>

                            );

                        })}

                    </tbody>

                </table>

            </div>

        </div>

    );

}



/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

   ADMIN DASHBOARD — MAIN COMPONENT

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const ADMIN_TABS = [

    { id: 'delivery-logs', label: 'Delivery Logs', icon: ClipboardList },

    { id: 'location-logs', label: 'Location Logs', icon: MapPin },

    { id: 'payments', label: 'Payment Monitoring', icon: DollarSign },

    { id: 'analytics', label: 'Analytics', icon: BarChart2 },

];



export default function AdminDashboard() {

    const [tab, setTab] = useState('delivery-logs');



    return (

        <div className="dash-body">

            {/* Sidebar */}

            <aside className="sidebar">

                <div className="sidebar-section-label">Admin Panel</div>

                {ADMIN_TABS.map(({ id, label, icon: Icon }) => (

                    <button key={id} className={`sidebar-link ${tab === id ? 'active' : ''}`}

                        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}

                        onClick={() => setTab(id)} id={`admin-tab-${id}`}

                    >

                        <Icon size={16} /> {label}

                    </button>

                ))}

                <div style={{ padding: '20px 18px', marginTop: 'auto' }}>

                    <div style={{ background: 'var(--bg-app)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>

                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin</div>

                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Supervisor</div>

                        <div style={{ fontSize: 11, color: 'var(--purple)', marginTop: 2 }}>Full Access</div>

                    </div>

                </div>

            </aside>



            <main className="main-area">

                {tab === 'delivery-logs' && <DeliveryLogsSection />}

                {tab === 'location-logs' && <LocationLogsSection />}

                {tab === 'payments' && <PaymentMonitorSection />}

                {tab === 'analytics' && <AnalyticsSection />}

            </main>

        </div>

    );

}

