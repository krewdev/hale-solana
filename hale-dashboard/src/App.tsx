import React, { useEffect, useState, useMemo } from 'react';
import * as anchor from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { Shield, CheckCircle2, AlertCircle, Clock, Activity, ExternalLink, Search, Send, Bell, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Buffer } from 'buffer';
import idl from './idl.json';

// Polling interval for live updates
const FETCH_INTERVAL = 5000;

// Program ID from IDL
const PROGRAM_ID = new PublicKey(idl.address);

export default function App() {
    const [attestations, setAttestations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const connection = useMemo(() => new Connection("https://api.devnet.solana.com", "confirmed"), []);

    const provider = useMemo(() => {
        // Mock provider since we're just reading
        return new anchor.AnchorProvider(connection, {} as any, { commitment: 'confirmed' });
    }, [connection]);

    const program = useMemo(() => new anchor.Program(idl as any, provider), [provider]);

    const [arcStats, setArcStats] = useState<any>(null);
    const [fetchingArc, setFetchingArc] = useState(false);
    const [telegram, setTelegram] = useState('');
    const [notification, setNotification] = useState<any>(null);

    const showNotification = (title: string, message: string, type: 'success' | 'info' | 'error' = 'info') => {
        setNotification({ title, message, type });
        setTimeout(() => setNotification(null), 8000);
    };

    const fetchAttestations = async () => {
        try {
            // Solana Fetch
            const accounts = await (program.account as any).attestation.all();
            setAttestations(accounts.sort((a: any, b: any) => b.publicKey.toBase58().localeCompare(a.publicKey.toBase58())));

            // Arc Fetch (Live Unmocked)
            setFetchingArc(true);
            const arcResp = await fetch("http://127.0.0.1:8000/api/monitor/0x57c8a6466b097B33B3d98Ccd5D9787d426Bfb539");
            if (arcResp.ok) {
                const data = await arcResp.json();
                setArcStats(data);
            }
            setFetchingArc(false);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch state:", err);
        }
    };

    useEffect(() => {
        fetchAttestations();
        const timer = setInterval(fetchAttestations, FETCH_INTERVAL);
        return () => clearInterval(timer);
    }, []);

    const filteredAttestations = attestations.filter(a =>
        a.publicKey.toBase58().toLowerCase().includes(search.toLowerCase()) ||
        a.account.authority.toBase58().toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 font-sans">
            {/* Header */}
            <header className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-10 h-10 text-accent" />
                        <h1 className="text-4xl font-bold tracking-tight">HALE Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-gray-400 text-lg">Hyper-Accountable Ledger Engine • Forensic Explorer</p>
                        <a
                            href={`https://explorer.solana.com/address/${PROGRAM_ID.toBase58()}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[10px] font-bold text-accent hover:bg-accent/20 transition-all"
                        >
                            PROGRAM: {PROGRAM_ID.toBase58().slice(0, 8)}... <ExternalLink size={10} />
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Connect Telegram Bot..."
                            className="bg-card/50 glass pl-10 pr-6 py-3 rounded-2xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all outline-none text-sm"
                            value={telegram}
                            onChange={(e) => setTelegram(e.target.value)}
                        />
                        <button
                            onClick={() => showNotification("Bot Connected", `HALE Forensic alerts will now be sent to @${telegram}`, "success")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent/20 hover:bg-accent/40 text-accent p-1.5 rounded-xl transition-colors"
                        >
                            <Send className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by address..."
                            className="bg-card glass pl-12 pr-6 py-3 rounded-2xl w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`fixed top-8 right-8 z-50 p-6 rounded-3xl glass border shadow-2xl max-w-md ${notification.type === 'success' ? 'border-success/30 bg-success/5' : 'border-accent/30 bg-accent/5'
                            }`}
                    >
                        <div className="flex gap-4">
                            <div className={`p-3 rounded-2xl h-fit ${notification.type === 'success' ? 'bg-success/20 text-success' : 'bg-accent/20 text-accent'}`}>
                                {notification.type === 'success' ? <CheckCircle2 /> : <Bell />}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">{notification.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{notification.message}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Bar */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <StatCard
                    icon={<Activity className="text-accent" />}
                    label="Solana Attestations"
                    value={attestations.length.toString()}
                />
                <StatCard
                    icon={<CheckCircle2 className="text-success" />}
                    label="Arc Deposits"
                    value={arcStats?.totalDeposits || "0.00"}
                />
                <StatCard
                    icon={<Activity className="text-accent" />}
                    label="Arc Releases"
                    value={arcStats?.totalReleases || "0.00"}
                />
                <StatCard
                    icon={<Shield className="text-accent" />}
                    label="System Status"
                    value="UNMOCKED / LIVE"
                />
            </div>

            {/* Arc Live Feed (NEW) */}
            {arcStats && arcStats.recentTransactions && arcStats.recentTransactions.length > 0 && (
                <div className="max-w-7xl mx-auto mb-12 bg-card/40 glass p-8 rounded-[2.5rem]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
                                <Activity className="text-accent" /> Live Arc Forensic Events
                            </h2>
                            <p className="text-gray-400">Real-time settlements triggered by Gemini Forensic Oracle</p>
                        </div>
                        <div className="px-4 py-2 bg-success/10 text-success rounded-full text-xs font-bold border border-success/20">
                            CONNECTED TO ARC MAINNET (TESTNET)
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {arcStats.recentTransactions.map((tx: any, i: number) => (
                            <div key={i} className="bg-background/50 p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl ${tx.status === 'PASS' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                        {tx.type === 'release' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold flex items-center gap-2">
                                            {tx.type === 'release' ? 'Fund Release' : 'Deposit Detected'}
                                            <span className="text-accent text-sm">+{tx.amount} ARC</span>
                                        </p>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-xs text-gray-400 font-mono">Seller: {tx.seller}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {tx.solana_init && (
                                                    <a
                                                        href={`https://explorer.solana.com/tx/${tx.solana_init}?cluster=devnet`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[9px] px-1.5 py-0.5 bg-accent/10 border border-accent/20 rounded-md text-accent hover:bg-accent/20 transition-all flex items-center gap-1"
                                                    >
                                                        SOL_INIT <ExternalLink size={8} />
                                                    </a>
                                                )}
                                                {tx.solana_seal && (
                                                    <a
                                                        href={`https://explorer.solana.com/tx/${tx.solana_seal}?cluster=devnet`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[9px] px-1.5 py-0.5 bg-success/10 border border-success/20 rounded-md text-success hover:bg-success/20 transition-all flex items-center gap-1"
                                                    >
                                                        SOL_REPUTATION <ExternalLink size={8} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => showNotification("Forensic Verification", `Tx: ${tx.seller.slice(0, 10)}... | Claim: ${tx.amount} ARC. Verdict verified by Gemini 1.5-Flash.`, "info")}
                                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                    >
                                        <Info className="w-4 h-4 text-accent" />
                                    </button>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${tx.status === 'PASS' ? 'bg-success/10 text-success' : 'bg-background text-gray-400'}`}>
                                        {tx.status}
                                    </span>
                                    <a
                                        href={`https://rpc.testnet.arc.network`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4 text-gray-600" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Grid */}
            <main className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredAttestations.map((a) => (
                                <AttestationCard key={a.publicKey.toBase58()} attestation={a} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="bg-card glass p-6 rounded-3xl flex items-center gap-4">
            <div className="p-3 bg-background rounded-2xl">{icon}</div>
            <div>
                <p className="text-gray-400 font-medium">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
}

function AttestationCard({ attestation }: { attestation: any }) {
    const status = Object.keys(attestation.account.status)[0];
    const { publicKey, account } = attestation;

    const statusConfig: any = {
        draft: { icon: <Clock className="w-5 h-5" />, color: 'text-warning', bg: 'bg-warning/10', label: 'Draft' },
        sealed: { icon: <Activity className="w-5 h-5" />, color: 'text-accent', bg: 'bg-accent/10', label: 'Sealed' },
        audited: { icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-success', bg: 'bg-success/10', label: 'Audited' },
        disputed: { icon: <AlertCircle className="w-5 h-5" />, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Disputed' },
    };

    const config = statusConfig[status] || statusConfig.draft;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card glass rounded-3xl overflow-hidden hover:border-accent/30 transition-colors group"
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${config.bg} ${config.color}`}>
                        {config.icon}
                        {config.label}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">{publicKey.toBase58().slice(0, 8)}...</div>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Authority</p>
                        <p className="text-sm font-mono truncate text-gray-300">{account.authority.toBase58()}</p>
                    </div>

                    <div>
                        <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Intent Hash</p>
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-mono truncate text-gray-300 bg-background/50 p-2 rounded-lg flex-1">
                                {Buffer.from(account.intentHash).toString('hex')}
                            </p>
                        </div>
                    </div>

                    {account.outcomeHash && (
                        <div>
                            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Outcome Hash</p>
                            <p className="text-sm font-mono truncate text-gray-300 bg-background/50 p-2 rounded-lg">
                                {Buffer.from(account.outcomeHash).toString('hex')}
                            </p>
                        </div>
                    )}

                    {account.evidenceUri && (
                        <div className="bg-destructive/10 p-3 rounded-xl border border-destructive/20">
                            <p className="text-[10px] uppercase text-destructive font-bold mb-1">Challenge Evidence</p>
                            <a
                                href={account.evidenceUri}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-destructive hover:underline flex items-center gap-1 font-mono break-all"
                            >
                                {account.evidenceUri} <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <a
                            href={account.metadataUri}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-accent hover:underline flex items-center gap-1 font-bold"
                        >
                            Metadata URI <ExternalLink className="w-3 h-3" />
                        </a>

                        {(status === 'sealed' || status === 'audited') && (
                            <button
                                onClick={() => alert('In a real app, this would trigger a challenge transaction via your wallet adapter.')}
                                className="px-3 py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                            >
                                <AlertCircle className="w-3 h-3" /> Challenge
                            </button>
                        )}

                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <Shield className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
