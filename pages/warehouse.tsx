import { useState } from 'react';
import { Warehouse, Package, Camera, AlertTriangle, CheckCircle, RefreshCw, Activity } from 'lucide-react';

const ZONES = [
    { id: 'A', name: 'Zone A — Inbound', capacity: 500, used: 342, status: 'normal' },
    { id: 'B', name: 'Zone B — Outbound', capacity: 400, used: 381, status: 'critical' },
    { id: 'C', name: 'Zone C — Returns', capacity: 200, used: 87, status: 'normal' },
    { id: 'D', name: 'Zone D — Fragile', capacity: 150, used: 120, status: 'warning' },
];

const CAMERAS = [
    { id: 'CAM-01', location: 'Entry Gate', status: 'live', detected: 14 },
    { id: 'CAM-02', location: 'Zone A Floor', status: 'live', detected: 28 },
    { id: 'CAM-03', location: 'Zone B Floor', status: 'offline', detected: 0 },
    { id: 'CAM-04', location: 'Loading Dock', status: 'live', detected: 7 },
];

function ZoneBar({ zone }: { zone: any }) {
    const pct = Math.round((zone.used / zone.capacity) * 100);
    const color = zone.status === 'critical' ? 'var(--red-primary)'
        : zone.status === 'warning' ? 'var(--yellow-primary)'
            : 'var(--green-primary)';

    return (
        <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{zone.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{zone.used} / {zone.capacity}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct}%</span>
                    {zone.status !== 'normal' && (
                        <AlertTriangle size={14} color={color} />
                    )}
                </div>
            </div>
            <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{
                    width: `${pct}%`,
                    background: zone.status === 'critical'
                        ? 'linear-gradient(90deg, #ef4444, #f97316)'
                        : zone.status === 'warning'
                            ? 'linear-gradient(90deg, #f59e0b, #eab308)'
                            : 'linear-gradient(90deg, #10b981, #06b6d4)',
                }} />
            </div>
        </div>
    );
}

export default function WarehousePage() {
    const [parcelCount, setParcelCount] = useState(1024);
    const [detecting, setDetecting] = useState(false);
    const [lastDetection, setLastDetection] = useState<number | null>(null);

    const totalCapacity = ZONES.reduce((a, z) => a + z.capacity, 0);
    const totalUsed = ZONES.reduce((a, z) => a + z.used, 0);
    const overallPct = Math.round((totalUsed / totalCapacity) * 100);

    const runDetection = () => {
        setDetecting(true);
        setTimeout(() => {
            const count = Math.floor(Math.random() * 30) + 10;
            setLastDetection(count);
            setParcelCount(prev => prev + count);
            setDetecting(false);
        }, 2500);
    };

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">Warehouse</h1>
                <p className="page-subtitle">Capacity, camera feeds & ML parcel detection</p>
            </div>

            {/* Top Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                {[
                    { label: 'Total Capacity', value: totalCapacity, color: 'var(--blue-bright)', bg: 'rgba(59,130,246,0.12)', icon: <Warehouse size={20} /> },
                    { label: 'Occupied', value: totalUsed, color: 'var(--yellow-primary)', bg: 'rgba(245,158,11,0.12)', icon: <Package size={20} /> },
                    { label: 'Available', value: totalCapacity - totalUsed, color: 'var(--green-primary)', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle size={20} /> },
                    { label: 'ML Parcel Count', value: parcelCount, color: 'var(--purple-primary)', bg: 'rgba(139,92,246,0.12)', icon: <Activity size={20} /> },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-number" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Zone Capacity */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div className="card-title">Zone Capacity</div>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Overall: <strong style={{ color: 'var(--text-primary)' }}>{overallPct}%</strong></span>
                    </div>
                    {ZONES.map(z => <ZoneBar key={z.id} zone={z} />)}

                    <div style={{
                        marginTop: 16, padding: '12px 16px',
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
                    }}>
                        <AlertTriangle size={14} color="var(--red-primary)" />
                        <span style={{ color: 'var(--red-primary)', fontWeight: 600 }}>Zone B Critical:</span>
                        <span style={{ color: 'var(--text-secondary)' }}>95% capacity — immediate action needed</span>
                    </div>
                </div>

                {/* Camera Feeds + ML */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card">
                        <div className="card-title" style={{ marginBottom: 16 }}>
                            <Camera size={16} style={{ display: 'inline', marginRight: 8 }} />
                            Camera Feeds
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {CAMERAS.map(cam => (
                                <div key={cam.id} style={{
                                    background: 'var(--bg-secondary)',
                                    border: `1px solid ${cam.status === 'live' ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                                    borderRadius: 8, padding: 12,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{cam.id}</span>
                                        <span className={`badge badge-sm ${cam.status === 'live' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                                            {cam.status === 'live' ? '● LIVE' : '○ OFF'}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{cam.location}</div>
                                    {cam.status === 'live' ? (
                                        <>
                                            <div style={{
                                                width: '100%', height: 60, borderRadius: 6,
                                                background: 'linear-gradient(135deg, #0a0f1e, #111827)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: '1px solid var(--border)', marginBottom: 6,
                                            }}>
                                                <Camera size={20} color="var(--text-muted)" />
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--green-primary)' }}>
                                                Detected: <strong>{cam.detected}</strong> parcels
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ fontSize: 11, color: 'var(--red-primary)' }}>Feed unavailable</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ML Detection */}
                    <div className="card">
                        <div className="card-title" style={{ marginBottom: 4 }}>ML Parcel Detection</div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                            YOLO-based parcel counting — point camera or upload image
                        </p>
                        {lastDetection && (
                            <div style={{
                                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                                borderRadius: 8, padding: '10px 14px', marginBottom: 12,
                                display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
                            }}>
                                <Activity size={14} color="var(--purple-primary)" />
                                <span style={{ color: 'var(--purple-primary)' }}>Detected <strong>{lastDetection}</strong> parcels in last scan</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button className="btn btn-primary" onClick={runDetection} disabled={detecting} style={{ flex: 1, justifyContent: 'center' }}>
                                {detecting ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Detecting…</> : '▶ Run Detection'}
                            </button>
                            <button className="btn btn-outline">Upload Image</button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
    );
}
