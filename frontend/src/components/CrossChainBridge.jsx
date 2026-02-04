import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, Link as LinkIcon, ExternalLink, CheckCircle, AlertCircle, Play } from 'lucide-react';
import './Landing.css'; // Reuse landing styles

const API_BASE = '/api';

const CrossChainBridge = () => {
    const [status, setStatus] = useState(null);
    const [mappings, setMappings] = useState({});
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(null);

    // Form state
    const [solanaAttestation, setSolanaAttestation] = useState('');
    const [arcSeller, setArcSeller] = useState('');
    const [useMock, setUseMock] = useState(true);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/bridge/status`);
            setStatus(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMappings = async () => {
        try {
            const res = await fetch(`${API_BASE}/bridge/mappings`);
            setMappings(await res.json());
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchStatus();
        fetchMappings();
        const interval = setInterval(fetchMappings, 5000); // Poll mappings
        return () => clearInterval(interval);
    }, []);

    const handleRegister = async () => {
        if (!solanaAttestation || !arcSeller) return;
        setLoading(true);
        try {
            await fetch(`${API_BASE}/bridge/mapping`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    solana_attestation: solanaAttestation,
                    arc_seller: arcSeller,
                    inject_mock: useMock
                })
            });
            setSolanaAttestation('');
            fetchMappings();
        } catch (e) {
            alert('Failed to register mapping');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async (pubkey) => {
        setSyncing(pubkey);
        try {
            const res = await fetch(`${API_BASE}/bridge/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attestation_pubkey: pubkey })
            });
            const data = await res.json();
            if (data.success) {
                // Success toast or alert
            } else {
                alert('Sync failed: ' + (data.message || 'Unknown error'));
            }
            fetchMappings();
        } catch (e) {
            alert('Sync error');
        } finally {
            setSyncing(null);
        }
    };

    return (
        <div className="landing-page" style={{ overflowY: 'auto', padding: '40px' }}>
            <div className="glass" style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div className="landing-brand">
                        <Shield className="brand-icon text-primary" />
                        <span style={{ fontSize: '24px' }}>CROSS-CHAIN BRIDGE</span>
                    </div>
                    {status && (
                        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#ccc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div className={`indicator ${status.arc_oracle_connected ? 'active' : ''}`} style={{ width: 8, height: 8, borderRadius: '50%', background: status.arc_oracle_connected ? '#00ffa3' : 'red' }}></div>
                                Arc Oracle {status.arc_oracle_connected ? 'Online' : 'Offline'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <RefreshCw size={14} /> Synced: {status.synced_count}
                            </div>
                        </div>
                    )}
                </div>

                {/* Registration Form */}
                <div className="glass" style={{ padding: '20px', marginBottom: '30px', background: 'rgba(255,255,255,0.03)' }}>
                    <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <LinkIcon size={20} className="text-secondary" /> Register New Mapping
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#888' }}>SOLANA ATTESTATION (PUBKEY)</label>
                            <input
                                type="text"
                                value={solanaAttestation}
                                onChange={(e) => setSolanaAttestation(e.target.value)}
                                placeholder="7xKXtg..."
                                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#888' }}>ARC SELLER ADDRESS (0x...)</label>
                            <input
                                type="text"
                                value={arcSeller}
                                onChange={(e) => setArcSeller(e.target.value)}
                                placeholder="0x123..."
                                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px' }}
                            />
                        </div>
                        <button
                            className="btn-primary"
                            onClick={handleRegister}
                            disabled={loading}
                            style={{ height: '42px', minWidth: '120px' }}
                        >
                            {loading ? 'Creating...' : 'Register'}
                        </button>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                            <input
                                type="checkbox"
                                checked={useMock}
                                onChange={(e) => setUseMock(e.target.checked)}
                            />
                            Inject Mock Data (Demo Mode) - Simulates "Audited" status instantly
                        </label>
                    </div>
                </div>

                {/* Mappings Table */}
                <h3 style={{ marginBottom: '15px' }}>Active Bridge Mappings</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#888' }}>
                                <th style={{ padding: '10px' }}>Solana Attestation</th>
                                <th style={{ padding: '10px' }}>Arc Seller</th>
                                <th style={{ padding: '10px' }}>Status</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(mappings).length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No active mappings found</td>
                                </tr>
                            ) : (
                                Object.values(mappings).map((m) => (
                                    <tr key={m.solana_attestation} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '15px 10px', fontFamily: 'monospace' }}>
                                            {m.solana_attestation.slice(0, 8)}...{m.solana_attestation.slice(-6)}
                                            <a href={`https://explorer.solana.com/address/${m.solana_attestation}?cluster=devnet`} target="_blank" rel="noreferrer" style={{ marginLeft: '8px', color: '#00ffa3' }}>
                                                <ExternalLink size={12} />
                                            </a>
                                        </td>
                                        <td style={{ padding: '15px 10px', fontFamily: 'monospace' }}>
                                            {m.arc_seller.slice(0, 6)}...{m.arc_seller.slice(-4)}
                                        </td>
                                        <td style={{ padding: '15px 10px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                background: m.status === 'synced' ? 'rgba(0, 255, 163, 0.1)' : 'rgba(255, 204, 0, 0.1)',
                                                color: m.status === 'synced' ? '#00ffa3' : '#ffcc00',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                {m.status === 'synced' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                {m.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                                            {m.status !== 'synced' && (
                                                <button
                                                    onClick={() => handleSync(m.solana_attestation)}
                                                    disabled={syncing === m.solana_attestation}
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid rgba(255,255,255,0.2)',
                                                        color: 'white',
                                                        padding: '6px 12px',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}
                                                >
                                                    {syncing === m.solana_attestation ? <RefreshCw size={12} className="spin" /> : <Play size={12} />}
                                                    Force Sync
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CrossChainBridge;
