import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Send, CheckCircle, XCircle, AlertCircle, Loader, Plus, Trash2, Cpu, Fingerprint, RefreshCw, Zap, Lock, Terminal, Activity, ExternalLink, ArrowRight, Box } from 'lucide-react';
import '../App.css'; // Ensure CSS is applied

export default function RoleSelection() {
    const navigate = useNavigate();

    return (
        <div className="role-page">
            <div className="role-content">
                <div className="role-header animate-fade-in">
                    <h1 className="role-title text-gradient">I am a...</h1>
                    <p className="role-subtitle">
                        Select your role to interact with the HALE Oracle protocol.
                        Deploy autonomous escrows or fulfill forensic delivery requests.
                    </p>
                </div>

                <div className="role-grid">
                    {/* Buyer Card */}
                    <div
                        onClick={() => navigate('/deploy')}
                        className="role-card glass-panel"
                    >
                        <div className="role-icon-wrapper">
                            <Shield size={48} className="role-icon-primary" />
                        </div>

                        <div className="role-card-content">
                            <div>
                                <h2 className="role-card-title">Buyer</h2>
                                <div className="role-tags">
                                    <span className="role-tag">Deploy Escrow</span>
                                    <span className="role-tag">Set Requirements</span>
                                </div>
                                <p className="role-card-desc">
                                    I want to request software delivery, create a new secured escrow, and define acceptance criteria for the Oracle.
                                </p>
                            </div>

                            <div className="role-action">
                                Start Deployment <ArrowRight className="action-icon" size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Seller Card */}
                    <div
                        onClick={() => navigate('/submit')}
                        className="role-card glass-panel"
                    >
                        <div className="role-icon-wrapper secondary-glow">
                            <Box size={48} className="role-icon-secondary" />
                        </div>

                        <div className="role-card-content">
                            <div>
                                <h2 className="role-card-title">Seller</h2>
                                <div className="role-tags">
                                    <span className="role-tag">Submit Code</span>
                                    <span className="role-tag">Get Verified</span>
                                </div>
                                <p className="role-card-desc">
                                    I have an OTP or Link. I want to submit my software delivery for AI verification and claim funds.
                                </p>
                            </div>

                            <div className="role-action secondary-text">
                                Submit Delivery <ArrowRight className="action-icon" size={20} />
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate('/connect-telegram'); }}
                                    className="text-xs text-secondary hover:text-white transition-colors flex items-center gap-1"
                                >
                                    Setup Notifications (Telegram) <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Protocol Integrity Footer */}
            <div className="protocol-integrity-footer animate-fade-in-delayed">
                <div className="integrity-container">
                    <div className="integrity-header">
                        <Activity size={16} className="text-accent" />
                        <span className="integrity-title">PROTOCOL INTEGRITY DEFLOYMENTS (DEVNET)</span>
                    </div>
                    <div className="integrity-grid">
                        <div className="integrity-item">
                            <span className="integrity-label">SOLANA FORENSIC ENGINE</span>
                            <code className="integrity-address">CnwQj2kPHpTbAvJT3ytzekrp7xd4HEtZJuEua9yn9MMe</code>
                        </div>
                        <div className="integrity-item">
                            <span className="integrity-label">SOLANA HALE ESCROW</span>
                            <code className="integrity-address">BCKogk1bxSti471AAyrWu3fEBLtbrE3nrwopKZrauEu6</code>
                        </div>
                        <div className="integrity-item">
                            <span className="integrity-label">ARC VAULT FACTORY</span>
                            <code className="integrity-address">0x4059fDf...C2e70</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
