import React, { useState, useEffect } from 'react';
import './Landing.css';

const API_BASE_URL = '/api';

function DeliverySubmission() {
    const [sellerAddress, setSellerAddress] = useState('');
    const [escrowAddress, setEscrowAddress] = useState('');
    const [otp, setOtp] = useState('');
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verdictData, setVerdictData] = useState(null);

    // Auto-fill from URL parameters (for shareable links)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlSeller = params.get('seller');
        const urlEscrow = params.get('escrow');
        const urlOtp = params.get('otp');

        if (urlSeller) setSellerAddress(urlSeller);
        if (urlEscrow) setEscrowAddress(urlEscrow);
        if (urlOtp) setOtp(urlOtp);

        if (urlSeller && urlOtp) {
            setStatus('✅ Link verified! You can now submit your code.');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setStatus('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/submit-delivery`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    seller_address: sellerAddress,
                    escrow_address: escrowAddress,
                    otp: otp,
                    code: code,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Submission failed');
            }

            setStatus('✅ Delivery submitted successfully! Oracle is verifying your code...');
            setOtp('');
            setCode('');

            // Poll for status
            pollStatus();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const pollStatus = async () => {
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/delivery-status/${sellerAddress}`);
                const data = await response.json();

                if (data.status === 'processing') {
                    setStatus('⏳ Oracle is verifying your code...');
                } else if (data.status === 'complete') {
                    // Show verdict details
                    setVerdictData(data);
                    if (data.verdict === 'PASS') {
                        setStatus(`✅ PASSED! (${data.confidence_score || data.confidence}% confidence)\n\n${data.reasoning}`);
                    } else if (data.verdict === 'FAIL') {
                        setStatus(`❌ FAILED (${data.confidence_score || data.confidence}% confidence)\n\n${data.reasoning}${data.risk_flags?.length ? '\n\nRisks: ' + data.risk_flags.join(', ') : ''}`);
                    } else {
                        setStatus(`📊 Verdict: ${data.verdict} (${data.confidence_score || data.confidence}%)\n\n${data.reasoning}`);
                    }
                    clearInterval(interval);
                } else if (data.status === 'completed') {
                    // Backwards compatibility
                    setStatus('✅ Verification complete!');
                    clearInterval(interval);
                } else if (data.status === 'failed') {
                    setStatus('❌ Verification failed. Funds refunded to buyer.');
                    clearInterval(interval);
                } else if (data.status === 'unknown') {
                    // Keep waiting - maybe processing hasn't started yet
                    setStatus('⏳ Waiting for Oracle verification...');
                }
            } catch (err) {
                console.error('Status poll error:', err);
            }
        }, 3000);

        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(interval), 300000);
    };

    return (
        <div className="page-container">
            <div className="content-wrapper">
                <div className="hero-section">
                    <h1 className="gradient-text">Submit Your Delivery</h1>
                    <p className="subtitle">
                        Enter your OTP and smart contract code to submit for verification
                    </p>
                </div>

                {/* Judge Demo Flow Banner */}
                <div style={{
                    marginBottom: '32px',
                    padding: '16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    maxWidth: '800px',
                    margin: '0 auto 32px'
                }}>
                    <div style={{
                        padding: '8px',
                        background: '#10b981',
                        borderRadius: '8px',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hackathon Judge Demo Flow</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>For judging, bypass the Telegram bot and use Master OTP: <strong style={{ color: '#10b981', fontFamily: 'monospace', letterSpacing: '0.1em', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>88888</strong></div>
                    </div>
                </div>

                <div className="form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="escrowAddress">Escrow Contract Address</label>
                            <input
                                type="text"
                                id="escrowAddress"
                                value={escrowAddress}
                                onChange={(e) => setEscrowAddress(e.target.value)}
                                placeholder="0x..."
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '16px',
                                    marginBottom: '20px'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sellerAddress">Your Wallet Address (Seller)</label>
                            <input
                                type="text"
                                id="sellerAddress"
                                value={sellerAddress}
                                onChange={(e) => setSellerAddress(e.target.value)}
                                placeholder="0x..."
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '16px',
                                    marginBottom: '20px'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="otp">5-Digit OTP (from Telegram)</label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="12345"
                                maxLength="5"
                                pattern="[0-9]{5}"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    fontSize: '24px',
                                    letterSpacing: '8px',
                                    textAlign: 'center',
                                    marginBottom: '20px'
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="code">Smart Contract Code</label>
                            <textarea
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="// SPDX-License-Identifier: MIT&#10;pragma solidity ^0.8.0;&#10;&#10;contract YourContract {&#10;    // Your code here&#10;}"
                                rows="20"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontFamily: 'monospace',
                                    marginBottom: '20px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                padding: '12px',
                                borderRadius: '8px',
                                background: 'rgba(255,0,0,0.1)',
                                border: '1px solid rgba(255,0,0,0.3)',
                                color: '#ff6b6b',
                                marginBottom: '20px'
                            }}>
                                ❌ {error}
                            </div>
                        )}

                        {status && (
                            <div style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    color: status.includes('✅') ? '#51cf66' : status.includes('❌') ? '#ff6b6b' : '#667eea',
                                    fontWeight: 'bold',
                                    marginBottom: '10px',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {status}
                                </div>

                                {verdictData && (verdictData.solana_init_tx || verdictData.solana_seal_tx) && (
                                    <div style={{
                                        marginTop: '15px',
                                        paddingTop: '15px',
                                        borderTop: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px'
                                    }}>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', textTransform: 'uppercase' }}>Forensic Proofs (Solana)</div>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            {verdictData.solana_init_tx && (
                                                <a
                                                    href={`https://explorer.solana.com/tx/${verdictData.solana_init_tx}?cluster=devnet`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{
                                                        fontSize: '11px',
                                                        padding: '6px 12px',
                                                        background: 'rgba(34, 211, 238, 0.1)',
                                                        border: '1px solid rgba(34, 211, 238, 0.3)',
                                                        borderRadius: '8px',
                                                        color: '#22d3ee',
                                                        textDecoration: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    SOL_INIT <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                                                </a>
                                            )}
                                            {verdictData.solana_seal_tx && (
                                                <a
                                                    href={`https://explorer.solana.com/tx/${verdictData.solana_seal_tx}?cluster=devnet`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    style={{
                                                        fontSize: '11px',
                                                        padding: '6px 12px',
                                                        background: 'rgba(16, 185, 129, 0.1)',
                                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                                        borderRadius: '8px',
                                                        color: '#10b981',
                                                        textDecoration: 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    SOL_FORENSIC_SEAL <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: loading
                                    ? 'rgba(255,255,255,0.1)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {loading ? '⏳ Submitting...' : '🚀 Submit Delivery'}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '40px',
                        padding: '20px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h3 style={{ marginBottom: '16px', color: '#fff' }}>📋 Instructions</h3>
                        <ol style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8' }}>
                            <li>You should have received a 5-digit OTP via Telegram</li>
                            <li>Enter your wallet address (the seller address from the escrow)</li>
                            <li>Enter the OTP you received</li>
                            <li>Paste your complete smart contract code</li>
                            <li>Click "Submit Delivery"</li>
                            <li>The HALE Oracle will verify your code using AI + sandbox testing</li>
                            <li>If verification passes with ≥90% confidence, funds are auto-released!</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeliverySubmission;
