import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import {
    QrCode, Truck, MapPin, CreditCard,
    CheckCircle, Clock, XCircle, AlertTriangle,
    RefreshCw, Zap, Search, Navigation,
    Banknote, Camera, User, Package, Wifi
} from 'lucide-react';

/* ── Mock API helpers ─────────────────────────────────────── */
const apiFetch = (_url: string, data: any) =>
    new Promise(res => setTimeout(() => res({ ok: true, data }), 800));

/* ══════════════════════════════════════════════════════════
   SCAN SECTION
══════════════════════════════════════════════════════════ */
const SCAN_HISTORY = [
    { id: 'PKG-001', agent: 'Ravi Kumar', time: '07:13:22', status: 'success', location: 'Gate A' },
    { id: 'PKG-002', agent: 'Ravi Kumar', time: '07:10:05', status: 'success', location: 'Dock 3' },
    { id: 'PKG-003', agent: 'Priya Sharma', time: '07:08:47', status: 'pending', location: 'Corridor B' },
    { id: 'PKG-004', agent: 'Priya Sharma', time: '07:05:31', status: 'failed', location: 'Exit 2' },
    { id: 'PKG-005', agent: 'Ankit Mehta', time: '07:06:12', status: 'success', location: 'Bay 4' },
    { id: 'PKG-006', agent: 'Leena Roy', time: '07:03:45', status: 'success', location: 'Gate C' },
    { id: 'PKG-007', agent: 'Sunita Tiwari', time: '07:01:00', status: 'pending', location: 'Loading Dock' },
];

function ScanSection({ agentScans }: { agentScans: any[] }) {
    const [scanning, setScanning] = useState(false);
    const [lineY, setLineY] = useState(10);
    const [scans, setScans] = useState(agentScans);
    const [last, setLast] = useState<string | null>(null);
    const [detail, setDetail] = useState<any>(null);

    useEffect(() => {
        if (!scanning) return;
        let raf: number;
        let start: number | null = null;
        const animate = (ts: number) => {
            if (!start) start = ts;
            const t = ((ts - start) / 2800) % 1;
            setLineY(t < 0.5 ? 10 + t * 2 * 75 : 85 - (t - 0.5) * 2 * 75);
            raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
        const timer = setTimeout(async () => {
            const id = `PKG-00${Math.floor(Math.random() * 90) + 10}`;
            await apiFetch('/api/scan', { parcelId: id });
            const scan = { id, time: new Date().toLocaleTimeString('en-GB'), status: 'success', location: 'Gate A' };
            setScans(p => [scan, ...p.slice(0, 7)]);
            setLast(id);
            setDetail({ weight: '2.1 kg', destination: '12 MG Road, Blr', cod: '₹450', recipient: 'Amit Shah' });
            setScanning(false);
            cancelAnimationFrame(raf);
        }, 3000);
        return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
    }, [scanning]);

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">Scan Parcel</h1>
                <p className="page-sub">QR / Barcode scanner — works offline with IndexedDB sync</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
                {/* Scanner */}
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{
                        position: 'relative', width: 200, height: 200, margin: '0 auto 16px',
                        background: 'var(--bg-app)', border: `2px solid ${scanning ? 'var(--blue)' : 'var(--border)'}`,
                        borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.3s',
                    }}>
                        {/* Corner brackets */}
                        {['tl', 'tr', 'bl', 'br'].map(c => (
                            <div key={c} style={{
                                position: 'absolute', width: 24, height: 24,
                                ...(c[0] === 't' ? { top: 10 } : { bottom: 10 }),
                                ...(c[1] === 'l' ? { left: 10 } : { right: 10 }),
                                borderColor: scanning ? 'var(--blue)' : 'var(--text-muted)',
                                borderStyle: 'solid', borderWidth: 0,
                                ...(c === 'tl' ? { borderTopWidth: 3, borderLeftWidth: 3 } : {}),
                                ...(c === 'tr' ? { borderTopWidth: 3, borderRightWidth: 3 } : {}),
                                ...(c === 'bl' ? { borderBottomWidth: 3, borderLeftWidth: 3 } : {}),
                                ...(c === 'br' ? { borderBottomWidth: 3, borderRightWidth: 3 } : {}),
                                borderRadius: 4,
                            }} />
                        ))}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: scanning ? 0.3 : 0.4 }}>
                            <QrCode size={70} color="var(--text-muted)" />
                        </div>
                        {scanning && (
                            <div style={{
                                position: 'absolute', left: 0, right: 0, top: `${lineY}%`, height: 2,
                                background: 'linear-gradient(90deg,transparent,var(--blue),transparent)',
                                boxShadow: '0 0 8px var(--blue)',
                            }} />
                        )}
                    </div>

                    {last && !scanning && (
                        <div className="alert alert-success" style={{ textAlign: 'left', fontSize: 12 }}>
                            <CheckCircle size={14} />
                            <div><strong>Scanned: {last}</strong>
                                {detail && <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
                                    Dest: {detail.destination}<br />COD: {detail.cod}
                                </div>}
                            </div>
                        </div>
                    )}

                    <button
                        className={`btn ${scanning ? 'btn-danger' : 'btn-primary'}`}
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => { setScanning(s => !s); if (scanning) { setLast(null); setDetail(null); } }}
                    >
                        {scanning ? <><RefreshCw size={14} className="spin" /> Scanning…</> : <><Zap size={14} /> Start Scan</>}
                    </button>
                    {scanning && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Point at QR or barcode</p>}
                </div>

                {/* Parcel Details + History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {detail && (
                        <div className="card" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
                            <div className="card-title" style={{ marginBottom: 14 }}>📦 Parcel Details — {last}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                {Object.entries({ Recipient: detail.recipient, Weight: detail.weight, Destination: detail.destination, 'COD Amount': detail.cod }).map(([k, v]) => (
                                    <div key={k} style={{ background: 'var(--bg-app)', borderRadius: 8, padding: '10px 14px' }}>
                                        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', fontWeight: 700 }}>{k}</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="card-title" style={{ marginBottom: 0 }}>Recent Scans</div>
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead><tr><th>Package ID</th><th>Time</th><th>Location</th><th>Status</th></tr></thead>
                            <tbody>
                                {scans.map((s, i) => (
                                    <tr key={i}>
                                        <td className="bold">{s.id}</td>
                                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.time}</td>
                                        <td>{s.location}</td>
                                        <td>
                                            {s.status === 'success' && <span className="badge badge-green"><CheckCircle size={10} /> Success</span>}
                                            {s.status === 'pending' && <span className="badge badge-yellow"><Clock size={10} /> Pending</span>}
                                            {s.status === 'failed' && <span className="badge badge-red"><XCircle size={10} /> Failed</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   DELIVERY SECTION
══════════════════════════════════════════════════════════ */
const DELIVERIES = [
    { id: 'DEL-2841', agent: 'Ravi Kumar', parcel: 'PKG-001', recipient: 'Amit Shah', address: '12 MG Road, Bangalore', status: 'pending', otp: null, proof: false, cod: 450 },
    { id: 'DEL-2842', agent: 'Ravi Kumar', parcel: 'PKG-002', recipient: 'Priya Nair', address: '45 Park St, Chennai', status: 'in-transit', otp: '3842', proof: false, cod: 320 },
    { id: 'DEL-2843', agent: 'Ravi Kumar', parcel: 'PKG-006', recipient: 'Suresh K.', address: '89 Station Rd, Pune', status: 'delivered', otp: '7251', proof: true, cod: 0 },
    { id: 'DEL-2846', agent: 'Priya Sharma', parcel: 'PKG-007', recipient: 'Anjali B.', address: '21 Anna Nagar, Chennai', status: 'pending', otp: null, proof: false, cod: 680 },
    { id: 'DEL-2847', agent: 'Priya Sharma', parcel: 'PKG-008', recipient: 'Mohan R.', address: '7 T Nagar, Chennai', status: 'in-transit', otp: '4519', proof: false, cod: 290 },
    { id: 'DEL-2848', agent: 'Ankit Mehta', parcel: 'PKG-009', recipient: 'Vijay P.', address: '33 FC Road, Pune', status: 'delivered', otp: '6627', proof: true, cod: 0 },
    { id: 'DEL-2849', agent: 'Ankit Mehta', parcel: 'PKG-010', recipient: 'Sneha T.', address: '15 Koregaon, Pune', status: 'pending', otp: null, proof: false, cod: 870 },
    { id: 'DEL-2844', agent: 'Leena Roy', parcel: 'PKG-004', recipient: 'Kiran M.', address: '3 Lal Bagh, Mysore', status: 'failed', otp: null, proof: false, cod: 560 },
    { id: 'DEL-2850', agent: 'Leena Roy', parcel: 'PKG-011', recipient: 'Renu S.', address: '88 Saraswati Nagar, Mys', status: 'in-transit', otp: '3310', proof: false, cod: 340 },
    { id: 'DEL-2845', agent: 'Sunita Tiwari', parcel: 'PKG-005', recipient: 'Darshan M.', address: '67 NH-48, Tumkur', status: 'pending', otp: null, proof: false, cod: 150 },
    { id: 'DEL-2851', agent: 'Sunita Tiwari', parcel: 'PKG-012', recipient: 'Lakshmi P.', address: '9 Main Rd, Tumkur', status: 'delivered', otp: '9988', proof: true, cod: 0 },
];

function DeliverySection({ agentDeliveries }: { agentDeliveries: any[] }) {
    const [deliveries, setDeliveries] = useState(agentDeliveries);
    const [otpInput, setOtpInput] = useState<Record<string, string>>({});
    const [otpMsg, setOtpMsg] = useState<Record<string, string>>({});
    const [search, setSearch] = useState('');

    const verifyOtp = async (id: string, expected: string) => {
        if (!otpInput[id]) return;
        await apiFetch('/api/delivery', { id, otp: otpInput[id] });
        if (otpInput[id] === expected) {
            setOtpMsg(p => ({ ...p, [id]: 'success' }));
            setDeliveries(p => p.map(d => d.id === id ? { ...d, status: 'delivered' } : d));
        } else {
            setOtpMsg(p => ({ ...p, [id]: 'fail' }));
        }
    };

    const captureProof = (id: string) => setDeliveries(p => p.map(d => d.id === id ? { ...d, proof: true } : d));
    const dispatch = (id: string) => setDeliveries(p => p.map(d => d.id === id ? { ...d, status: 'in-transit', otp: String(Math.floor(1000 + Math.random() * 9000)) } : d));

    const filtered = deliveries.filter(d =>
        d.id.toLowerCase().includes(search.toLowerCase()) ||
        d.recipient.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">My Deliveries</h1>
                <p className="page-sub">Assigned parcels, OTP verification & proof of delivery</p>
            </div>

            <div className="stats-grid">
                {[
                    { label: 'Total', v: deliveries.length, color: 'var(--blue)', bg: 'var(--blue-bg)', icon: <Package size={18} /> },
                    { label: 'Pending', v: deliveries.filter(d => d.status === 'pending').length, color: 'var(--yellow)', bg: 'var(--yellow-bg)', icon: <Clock size={18} /> },
                    { label: 'Delivered', v: deliveries.filter(d => d.status === 'delivered').length, color: 'var(--green)', bg: 'var(--green-bg)', icon: <CheckCircle size={18} /> },
                    { label: 'Failed', v: deliveries.filter(d => d.status === 'failed').length, color: 'var(--red)', bg: 'var(--red-bg)', icon: <XCircle size={18} /> },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.v}</div>
                    </div>
                ))}
            </div>

            <div className="filter-bar">
                <div className="search-wrap">
                    <Search className="search-icon" size={15} />
                    <input className="search-input" placeholder="Search by ID or recipient…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {filtered.map(d => (
                    <div key={d.id} className="card" style={{
                        borderLeft: `3px solid ${d.status === 'delivered' ? 'var(--green)' : d.status === 'failed' ? 'var(--red)' : d.status === 'in-transit' ? 'var(--blue)' : 'var(--yellow)'}`,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            {/* Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15 }}>{d.id}</span>
                                    <span className="badge badge-blue">{d.parcel}</span>
                                    {d.status === 'delivered' && <span className="badge badge-green"><CheckCircle size={10} /> Delivered</span>}
                                    {d.status === 'in-transit' && <span className="badge badge-blue"><Truck size={10} /> In Transit</span>}
                                    {d.status === 'pending' && <span className="badge badge-yellow"><Clock size={10} /> Pending</span>}
                                    {d.status === 'failed' && <span className="badge badge-red"><XCircle size={10} /> Failed</span>}
                                    {d.proof && <span className="badge badge-green"><Camera size={10} /> Proof ✓</span>}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                    <span><User size={12} style={{ display: 'inline', marginRight: 4 }} />{d.recipient}</span>
                                    <span><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />{d.address}</span>
                                    {d.cod > 0 && <span><Banknote size={12} style={{ display: 'inline', marginRight: 4 }} />COD: ₹{d.cod}</span>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                {d.status === 'pending' && (
                                    <button className="btn btn-primary btn-sm" onClick={() => dispatch(d.id)}>Dispatch</button>
                                )}
                                {d.status === 'in-transit' && !d.proof && (
                                    <button className="btn btn-outline btn-sm" onClick={() => captureProof(d.id)}>
                                        <Camera size={13} /> Capture Proof
                                    </button>
                                )}
                                {d.status === 'in-transit' && d.otp && (
                                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <input
                                            placeholder={`OTP (hint: ${d.otp})`}
                                            value={otpInput[d.id] || ''}
                                            onChange={e => setOtpInput(p => ({ ...p, [d.id]: e.target.value }))}
                                            style={{
                                                background: 'var(--bg-input)', border: '1px solid var(--border)',
                                                borderRadius: 6, padding: '5px 10px', fontSize: 13, color: 'var(--text-primary)',
                                                width: 160, fontFamily: 'Inter', outline: 'none',
                                            }}
                                        />
                                        <button className="btn btn-success btn-sm" onClick={() => verifyOtp(d.id, d.otp)}>Verify</button>
                                        {otpMsg[d.id] === 'success' && <CheckCircle size={16} color="var(--green)" />}
                                        {otpMsg[d.id] === 'fail' && <XCircle size={16} color="var(--red)" />}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   LOCATION SECTION
══════════════════════════════════════════════════════════ */
function LocationSection() {
    const [tracking, setTracking] = useState(false);
    const [gps, setGps] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const startTracking = () => {
        if (!navigator.geolocation) {
            // Simulate GPS if not available
            simulateGPS();
            return;
        }
        setTracking(true);
        navigator.geolocation.getCurrentPosition(
            pos => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: Math.round(pos.coords.accuracy), time: new Date().toLocaleTimeString('en-GB') };
                setGps(loc);
                setHistory(h => [loc, ...h.slice(0, 9)]);
                apiFetch('/api/location', loc);
            },
            () => simulateGPS()
        );
    };

    const simulateGPS = () => {
        setTracking(true);
        const lat = 12.9716 + (Math.random() - 0.5) * 0.02;
        const lng = 77.5946 + (Math.random() - 0.5) * 0.02;
        const loc = { lat: +lat.toFixed(6), lng: +lng.toFixed(6), acc: 12, time: new Date().toLocaleTimeString('en-GB') };
        setTimeout(() => {
            setGps(loc);
            setHistory(h => [loc, ...h.slice(0, 9)]);
            apiFetch('/api/location', loc);
        }, 600);
    };

    const stopTracking = () => setTracking(false);

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">Location Tracking</h1>
                <p className="page-sub">GPS position with offline storage and background sync</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Current Position */}
                <div className="card">
                    <div className="card-title">Current Position</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div className={`status-dot ${tracking ? 'dot-green' : 'dot-red'}`} style={{ width: 10, height: 10 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: tracking ? 'var(--green)' : 'var(--red)' }}>
                            {tracking ? 'Active — Tracking' : 'Inactive'}
                        </span>
                    </div>

                    {gps ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                            {[['Latitude', gps.lat], ['Longitude', gps.lng], ['Accuracy', `±${gps.acc}m`], ['Last Update', gps.time]].map(([k, v]) => (
                                <div key={k} style={{ background: 'var(--bg-app)', borderRadius: 8, padding: '10px 14px' }}>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k}</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--cyan)', fontFamily: 'monospace', marginTop: 3 }}>{v}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                            <Navigation size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                            <br />No location data yet
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-primary" onClick={startTracking} disabled={tracking} style={{ flex: 1, justifyContent: 'center' }}>
                            <Navigation size={14} /> {tracking ? 'Tracking…' : 'Get Location'}
                        </button>
                        {tracking && <button className="btn btn-outline" onClick={stopTracking}>Stop</button>}
                    </div>
                </div>

                {/* Geofence Status */}
                <div className="card">
                    <div className="card-title">Geofence Status</div>
                    <div style={{ marginBottom: 16 }}>
                        {[
                            { name: 'Warehouse A', center: '12.9716, 77.5946', radius: '500m', status: gps ? 'inside' : 'unknown' },
                            { name: 'Delivery Zone 1', center: '13.0827, 80.2707', radius: '2km', status: 'outside' },
                        ].map(z => (
                            <div key={z.name} style={{ background: 'var(--bg-app)', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{z.name}</span>
                                    <span className={`badge ${z.status === 'inside' ? 'badge-green' : z.status === 'outside' ? 'badge-red' : 'badge-yellow'}`}>
                                        {z.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Center: {z.center} · Radius: {z.radius}</div>
                            </div>
                        ))}
                    </div>
                    {gps && (
                        <div className="alert alert-info" style={{ fontSize: 12 }}>
                            <Wifi size={14} />
                            You are inside Warehouse A boundary. Geofence events are being logged.
                        </div>
                    )}
                </div>
            </div>

            {/* Location History */}
            {history.length > 0 && (
                <>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Location History</div>
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead><tr><th>#</th><th>Latitude</th><th>Longitude</th><th>Accuracy</th><th>Time</th></tr></thead>
                            <tbody>
                                {history.map((h, i) => (
                                    <tr key={i}>
                                        <td style={{ color: 'var(--text-muted)' }}>#{history.length - i}</td>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--cyan)' }}>{h.lat}</td>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--cyan)' }}>{h.lng}</td>
                                        <td>±{h.acc}m</td>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 12 }}>{h.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   PAYMENT SECTION
══════════════════════════════════════════════════════════ */
const RECENT_TXNS = [
    { id: 'TXN-5001', agent: 'Ravi Kumar', order: 'DEL-2841', expected: 450, collected: 450, mode: 'UPI', status: 'matched', time: '07:02' },
    { id: 'TXN-5002', agent: 'Ravi Kumar', order: 'DEL-2842', expected: 320, collected: 300, mode: 'Cash', status: 'mismatch', time: '07:08' },
    { id: 'TXN-5003', agent: 'Ankit Mehta', order: 'DEL-2848', expected: 870, collected: 870, mode: 'Card', status: 'matched', time: '07:15' },
    { id: 'TXN-5004', agent: 'Priya Sharma', order: 'DEL-2847', expected: 290, collected: 290, mode: 'UPI', status: 'matched', time: '07:20' },
    { id: 'TXN-5005', agent: 'Leena Roy', order: 'DEL-2850', expected: 340, collected: 360, mode: 'Cash', status: 'mismatch', time: '07:25' },
    { id: 'TXN-5006', agent: 'Sunita Tiwari', order: 'DEL-2845', expected: 150, collected: 0, mode: 'Cash', status: 'pending', time: '07:30' },
];

function PaymentSection({ agentTxns }: { agentTxns: any[] }) {
    const [form, setForm] = useState({ orderId: '', expected: '', collected: '', mode: 'UPI' });
    const [txns, setTxns] = useState(agentTxns);
    const [toast, setToast] = useState<string | null>(null);
    const diff = Number(form.collected) - Number(form.expected);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const status = !form.collected || Number(form.collected) === 0 ? 'pending'
            : Number(form.collected) === Number(form.expected) ? 'matched' : 'mismatch';
        await apiFetch('/api/payment', form);
        setTxns(p => [{
            id: `TXN-${5100 + p.length}`,
            order: form.orderId || `DEL-${9000 + p.length}`,
            expected: Number(form.expected), collected: Number(form.collected),
            mode: form.mode, status, time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        }, ...p]);
        setToast(status === 'matched' ? 'success' : status === 'mismatch' ? 'mismatch' : 'pending');
        setForm({ orderId: '', expected: '', collected: '', mode: 'UPI' });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">Payment</h1>
                <p className="page-sub">Record COD, UPI and card payments with mismatch detection</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
                {/* Form */}
                <div className="card">
                    <div className="card-title">Record Payment</div>
                    {toast === 'success' && <div className="alert alert-success"><CheckCircle size={14} /> Payment matched and recorded!</div>}
                    {toast === 'mismatch' && <div className="alert alert-warning"><AlertTriangle size={14} /> Mismatch detected and flagged.</div>}
                    {toast === 'pending' && <div className="alert alert-info"><Clock size={14} /> Pending payment recorded.</div>}

                    <form onSubmit={submit}>
                        <div className="form-group">
                            <label className="form-label">Delivery / Order ID</label>
                            <input className="form-input" placeholder="DEL-XXXX" value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Expected Amount (₹)</label>
                            <input className="form-input" type="number" placeholder="0" value={form.expected} onChange={e => setForm(f => ({ ...f, expected: e.target.value }))} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Collected Amount (₹)</label>
                            <input className="form-input" type="number" placeholder="0" value={form.collected} onChange={e => setForm(f => ({ ...f, collected: e.target.value }))} required />
                        </div>

                        {form.expected && form.collected && diff !== 0 && (
                            <div className="alert alert-warning" style={{ marginBottom: 14 }}>
                                <AlertTriangle size={14} />
                                {diff < 0 ? `Short by ₹${Math.abs(diff)}` : `Excess ₹${diff}`} — will be flagged
                            </div>
                        )}
                        {form.expected && form.collected && diff === 0 && Number(form.expected) > 0 && (
                            <div className="alert alert-success" style={{ marginBottom: 14 }}>
                                <CheckCircle size={14} /> Amounts match ✓
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Payment Mode</label>
                            <select className="form-select" value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
                                <option value="UPI">UPI</option>
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            <CreditCard size={14} /> Record Payment
                        </button>
                    </form>
                </div>

                {/* Recent Transactions */}
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Recent Transactions</div>
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead><tr><th>Txn ID</th><th>Order</th><th>Expected</th><th>Collected</th><th>Mode</th><th>Time</th><th>Status</th></tr></thead>
                            <tbody>
                                {txns.map(t => (
                                    <tr key={t.id} style={t.status === 'mismatch' ? { background: 'rgba(239,68,68,0.04)' } : {}}>
                                        <td className="bold">{t.id}</td>
                                        <td style={{ color: 'var(--blue)', fontWeight: 600 }}>{t.order}</td>
                                        <td>₹{t.expected}</td>
                                        <td>₹{t.collected}</td>
                                        <td><span className="badge badge-blue">{t.mode}</span></td>
                                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.time}</td>
                                        <td>
                                            {t.status === 'matched' && <span className="badge badge-green"><CheckCircle size={10} /> Matched</span>}
                                            {t.status === 'mismatch' && <span className="badge badge-red"><AlertTriangle size={10} /> Mismatch</span>}
                                            {t.status === 'pending' && <span className="badge badge-yellow"><Clock size={10} /> Pending</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   DELIVERY DASHBOARD — MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const TABS = [
    { id: 'scan', label: 'Scan', icon: QrCode },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
];

export default function DeliveryDashboard() {
    const [tab, setTab] = useState('scan');
    const { user } = useAuth();
    const agentName = user?.name || 'Unknown Agent';

    // Filter all mock data to only show the logged-in agent's records
    const agentScans = SCAN_HISTORY.filter(s => s.agent === agentName);
    const agentDeliveries = DELIVERIES.filter(d => d.agent === agentName);
    const agentTxns = RECENT_TXNS.filter(t => t.agent === agentName);

    return (
        <div className="dash-body">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-section-label">Delivery Agent</div>
                {TABS.map(({ id, label, icon: Icon }) => (
                    <button key={id} className={`sidebar-link ${tab === id ? 'active' : ''}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                        onClick={() => setTab(id)} id={`delivery-tab-${id}`}
                    >
                        <Icon size={16} /> {label}
                    </button>
                ))}
                <div style={{ padding: '20px 18px', marginTop: 'auto' }}>
                    <div style={{ background: 'var(--bg-app)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Logged In As</div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{agentName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
                        <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="status-dot dot-green" /> Online · {agentDeliveries.length} deliveries assigned
                        </div>
                    </div>
                </div>
            </aside>

            <main className="main-area">
                {tab === 'scan' && <ScanSection agentScans={agentScans} />}
                {tab === 'delivery' && <DeliverySection agentDeliveries={agentDeliveries} />}
                {tab === 'location' && <LocationSection />}
                {tab === 'payment' && <PaymentSection agentTxns={agentTxns} />}
            </main>
        </div>
    );
}
