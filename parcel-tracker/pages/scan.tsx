import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, QrCode, RefreshCw, Zap } from 'lucide-react';

const MOCK_SCANS: { id: string, time: string, status: 'success' | 'pending' | 'failed', agent: string, location: string }[] = [
    { id: 'PKG-001', time: '07:13:22', status: 'success', agent: 'Ravi K.', location: 'Gate A' },
    { id: 'PKG-002', time: '07:10:05', status: 'success', agent: 'Priya S.', location: 'Dock 3' },
    { id: 'PKG-003', time: '07:08:47', status: 'pending', agent: 'Ankit M.', location: 'Corridor B' },
    { id: 'PKG-004', time: '07:05:31', status: 'failed', agent: 'Leena R.', location: 'Exit 2' },
    { id: 'PKG-005', time: '07:02:14', status: 'success', agent: 'Ravi K.', location: 'Gate A' },
    { id: 'PKG-006', time: '06:59:00', status: 'pending', agent: 'Sunita T.', location: 'Dock 1' },
];

function StatusBadge({ status }: { status: 'success' | 'pending' | 'failed' }) {
    const map = {
        success: { cls: 'badge-success', icon: <CheckCircle size={11} />, label: 'Success' },
        pending: { cls: 'badge-warning', icon: <Clock size={11} />, label: 'Pending' },
        failed: { cls: 'badge-danger', icon: <XCircle size={11} />, label: 'Failed' },
    };
    const { cls, icon, label } = map[status];
    return <span className={`badge ${cls}`}>{icon} {label}</span>;
}

export default function ScanPage() {
    const [scanning, setScanning] = useState(false);
    const [lastScanned, setLastScanned] = useState<string | null>(null);
    const [scans, setScans] = useState(MOCK_SCANS);
    const [linePos, setLinePos] = useState(10);

    useEffect(() => {
        if (!scanning) return;
        const ids = ['PKG-007', 'PKG-008', 'PKG-009', 'PKG-010'];
        let frame: number;
        let start: number | null = null;
        const animate = (ts: number) => {
            if (!start) start = ts;
            const elapsed = ((ts - start) / 3000) % 1;
            setLinePos(elapsed < 0.5 ? 10 + elapsed * 2 * 75 : 85 - (elapsed - 0.5) * 2 * 75);
            frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);

        const timer = setTimeout(() => {
            const newPkg = ids[Math.floor(Math.random() * ids.length)];
            const newScan = {
                id: newPkg,
                time: new Date().toLocaleTimeString('en-GB'),
                status: 'success' as const,
                agent: 'Field Agent',
                location: 'Gate A',
            };
            setScans(prev => [newScan, ...prev.slice(0, 8)]);
            setLastScanned(newPkg);
            setScanning(false);
            cancelAnimationFrame(frame);
        }, 3000);

        return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
    }, [scanning]);

    const successCount = scans.filter(s => s.status === 'success').length;
    const pendingCount = scans.filter(s => s.status === 'pending').length;
    const failedCount = scans.filter(s => s.status === 'failed').length;

    return (
        <div className="animate-in">
            <div className="page-header">
                <h1 className="page-title">Parcel Scanner</h1>
                <p className="page-subtitle">QR & Barcode scanning — offline capable</p>
            </div>

            <div className="stats-grid">
                {[
                    { label: 'Successful', value: successCount, color: 'var(--green-primary)', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle size={20} /> },
                    { label: 'Pending', value: pendingCount, color: 'var(--yellow-primary)', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={20} /> },
                    { label: 'Failed', value: failedCount, color: 'var(--red-primary)', bg: 'rgba(239,68,68,0.12)', icon: <XCircle size={20} /> },
                    { label: 'Total Scans', value: scans.length, color: 'var(--blue-bright)', bg: 'rgba(59,130,246,0.12)', icon: <QrCode size={20} /> },
                ].map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-number" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>
                {/* Scan Zone */}
                <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{
                        position: 'relative',
                        width: 220, height: 220,
                        margin: '0 auto 20px',
                        background: 'rgba(59,130,246,0.05)',
                        border: '2px solid var(--border)',
                        borderRadius: 12,
                        overflow: 'hidden',
                    }}>
                        {/* Corner brackets */}
                        {['topleft', 'topright', 'botleft', 'botright'].map(pos => (
                            <div key={pos} style={{
                                position: 'absolute',
                                width: 28, height: 28,
                                borderColor: scanning ? 'var(--blue-bright)' : 'var(--text-muted)',
                                borderStyle: 'solid',
                                borderWidth: 0,
                                ...(pos.includes('top') ? { top: 12 } : { bottom: 12 }),
                                ...(pos.includes('left') ? { left: 12 } : { right: 12 }),
                                ...(pos.includes('top') && pos.includes('left') ? { borderTopWidth: 3, borderLeftWidth: 3 } : {}),
                                ...(pos.includes('top') && pos.includes('right') ? { borderTopWidth: 3, borderRightWidth: 3 } : {}),
                                ...(pos.includes('bot') && pos.includes('left') ? { borderBottomWidth: 3, borderLeftWidth: 3 } : {}),
                                ...(pos.includes('bot') && pos.includes('right') ? { borderBottomWidth: 3, borderRightWidth: 3 } : {}),
                                borderRadius: 4,
                            }} />
                        ))}

                        {/* QR Icon */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            height: '100%', color: scanning ? 'var(--blue-bright)' : 'var(--text-muted)',
                            opacity: scanning ? 0.3 : 0.5,
                        }}>
                            <QrCode size={72} />
                        </div>

                        {/* Scan line */}
                        {scanning && (
                            <div style={{
                                position: 'absolute', left: 0, right: 0,
                                top: `${linePos}%`,
                                height: 2,
                                background: 'linear-gradient(90deg, transparent, var(--blue-bright), transparent)',
                                boxShadow: '0 0 8px var(--blue-primary)',
                                transition: 'none',
                            }} />
                        )}
                    </div>

                    {lastScanned && !scanning && (
                        <div style={{
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                            borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13,
                            color: 'var(--green-primary)',
                        }}>
                            <CheckCircle size={14} style={{ display: 'inline', marginRight: 6 }} />
                            Scanned: <strong>{lastScanned}</strong>
                        </div>
                    )}

                    <button
                        className={`btn ${scanning ? 'btn-danger' : 'btn-primary'}`}
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => { setScanning(s => !s); if (scanning) setLastScanned(null); }}
                    >
                        {scanning ? <><RefreshCw size={16} className="spin" /> Scanning…</> : <><Zap size={16} /> Start Scan</>}
                    </button>

                    {scanning && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                            Point camera at QR or barcode
                        </p>
                    )}
                </div>

                {/* Recent Scans */}
                <div>
                    <div className="section-title">Recent Scans</div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Package ID</th>
                                    <th>Time</th>
                                    <th>Agent</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scans.map((scan, i) => (
                                    <tr key={i}>
                                        <td className="highlight">{scan.id}</td>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{scan.time}</td>
                                        <td>{scan.agent}</td>
                                        <td>{scan.location}</td>
                                        <td><StatusBadge status={scan.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
