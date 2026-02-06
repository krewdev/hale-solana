import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Wallet, Link, Zap, Shield, CheckCircle, Activity, AlertTriangle, ArrowRight, Copy, Check, Rocket, MessageSquare, ExternalLink, ChevronRight } from 'lucide-react'
import factoryAbi from '../factory_abi.json'
import erc20Abi from '../erc20_abi.json'
import { NETWORKS, connectWallet, switchNetwork } from '../utils/wallet';

const WALLET_TYPES = [
  { id: 'metamask', name: 'MetaMask', icon: Wallet, description: 'Connect with MetaMask browser extension', color: '#F6851B' },
  { id: 'walletconnect', name: 'WalletConnect', icon: Link, description: 'Scan QR code with your mobile wallet', color: '#3B99FC' }
];

// Minimal ABI for ArcFuseEscrow
const MINIMAL_ESCROW_ABI = [
  "function deposit(address seller) external payable",
  "function setContractRequirements(address seller, string calldata requirements, string calldata sellerContact) external"
];

function Deployment() {
  const [activeStep, setActiveStep] = useState('select') // select -> requirements -> complete
  const [currentNetwork, setCurrentNetwork] = useState(null)

  // State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deployedAddress, setDeployedAddress] = useState('')
  const [deployTxHash, setDeployTxHash] = useState('')
  const [fundTxHash, setFundTxHash] = useState('')
  const [copied, setCopied] = useState(false)

  // Requirement Inputs
  const [formData, setFormData] = useState({
    sellerAddress: '',
    amount: '0.1',
    requirements: '',
    telegram: ''
  })

  // Result
  const [submissionLink, setSubmissionLink] = useState('')

  useEffect(() => {
    detectNetwork();
    if (window.ethereum) {
      window.ethereum.on('chainChanged', detectNetwork);
    }
  }, []);

  const detectNetwork = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainIdHex = "0x" + Number(network.chainId).toString(16);
      const matchedNetwork = Object.values(NETWORKS).find(n => n.chainId.toLowerCase() === chainIdHex.toLowerCase());
      setCurrentNetwork(matchedNetwork || { name: "Unsupported", chainId: chainIdHex });
    } catch (e) {
      console.error("Error detecting network:", e);
    }
  }

  // STEP 1: DEPLOY ESCROW
  const connectAndDeployFactory = async () => {
    setLoading(true); setError(null);
    try {
      const { provider, signer } = await connectWallet();

      // Network Check & Switch
      const network = await provider.getNetwork();
      const chainIdHex = "0x" + Number(network.chainId).toString(16);
      let targetNetwork = Object.values(NETWORKS).find(n => n.chainId.toLowerCase() === chainIdHex.toLowerCase());

      if (!targetNetwork || targetNetwork.chainId.toLowerCase() !== NETWORKS.ARC_TESTNET.chainId.toLowerCase()) {
        try {
          await switchNetwork(window.ethereum, 'ARC_TESTNET');
          targetNetwork = NETWORKS.ARC_TESTNET;
        } catch (e) { throw new Error("Please switch to Arc Testnet manually."); }
      }

      const factory = new ethers.Contract(targetNetwork.factoryAddress, factoryAbi, signer);

      // Force legacy gas for Arc
      const feeData = await provider.getFeeData();
      const overrides = { gasPrice: feeData.gasPrice };

      console.log("Creating Escrow...");
      const tx = await factory.createEscrow(overrides);
      await tx.wait();
      const receipt = await tx.wait();

      let newEscrowAddress = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = factory.interface.parseLog(log);
          if (parsedLog.name === 'EscrowCreated') {
            newEscrowAddress = parsedLog.args[0];
            break;
          }
        } catch (e) { continue; }
      }

      if (newEscrowAddress) {
        setDeployedAddress(newEscrowAddress);
        setDeployTxHash(tx.hash);
        setActiveStep('requirements');
      } else {
        throw new Error("Escrow address not found in receipt.");
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Deployment failed");
    } finally {
      setLoading(false);
    }
  }

  // STEP 2: FUND & STIPULATE
  const handleDepositAndSetRequirements = async () => {
    if (!formData.sellerAddress || !formData.amount || !formData.requirements) {
      setError("Please fill in seller address, amount, and requirements.");
      return;
    }
    setLoading(true); setError(null);

    try {
      const { provider, signer } = await connectWallet();
      const escrow = new ethers.Contract(deployedAddress, MINIMAL_ESCROW_ABI, signer);

      const feeData = await provider.getFeeData();

      // 1. DEPOSIT (Native Token)
      console.log("Depositing funds...");
      const overrides1 = {
        value: ethers.parseEther(formData.amount),
        gasPrice: feeData.gasPrice
      };

      const tx1 = await escrow.deposit(formData.sellerAddress, overrides1);
      await tx1.wait();

      // 2. SET REQUIREMENTS
      console.log("Setting requirements...");
      const overrides2 = { gasPrice: feeData.gasPrice };

      const tx2 = await escrow.setContractRequirements(
        formData.sellerAddress,
        formData.requirements,
        formData.telegram || "",
        overrides2
      );
      await tx2.wait();
      setFundTxHash(tx2.hash);

      // 3. GENERATE LINK
      if (!formData.telegram) {
        const link = `/submit?escrow=${deployedAddress}&seller=${formData.sellerAddress}`;
        setSubmissionLink(link);
      }

      setActiveStep('complete');

    } catch (err) {
      console.error(err);
      setError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="page-container animate-fade-in max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="page-header mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl"><Rocket size={32} className="text-emerald-400" /></div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Vault Factory</h1>
            <p className="text-gray-400 text-sm">Deploy autonomous, AI-verified escrow vaults on the Circle Arc network.</p>
          </div>
        </div>

        {/* Protocol Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1 uppercase tracking-widest">
              <Shield size={12} /> Step 1: Deploy
            </div>
            <p className="text-[10px] text-gray-400">Mint a unique, trustless escrow contract for your specific transaction.</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-1 uppercase tracking-widest">
              <Zap size={12} /> Step 2: Ignite
            </div>
            <p className="text-[10px] text-gray-400">Deposit funds and stipulate exact requirements for the HALE Oracle.</p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1 uppercase tracking-widest">
              <Activity size={12} /> Step 3: Audit
            </div>
            <p className="text-[10px] text-gray-400">The Oracle verifies the delivery. Funds release automatically upon 'PASS'.</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-2 mb-8">
          {['select', 'requirements', 'complete'].map((step, i) => (
            <div key={step} className={`h-1 flex-1 rounded-full transition-all duration-500 ${['select', 'requirements', 'complete'].indexOf(activeStep) >= i ? 'bg-emerald-500' : 'bg-white/10'
              }`} />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 font-mono text-sm">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: DEPLOY */}
      {activeStep === 'select' && (
        <div className="glass-panel p-8">
          <h2 className="text-xl font-black text-white mb-2 uppercase italic text-emerald-400">01. Initialize Ledger</h2>
          <p className="text-gray-500 text-sm mb-6">Select your primary wallet to authorize the contract deployment on Arc.</p>

          <div className="grid gap-4 mb-8">
            {WALLET_TYPES.map((wallet) => (
              <button key={wallet.id} className="wallet-button p-6 relative group border border-white/5 hover:border-emerald-500/30 transition-all bg-white/5 rounded-2xl" disabled={loading} onClick={() => {
                if (wallet.id === 'metamask') connectAndDeployFactory();
                else setError("Please use MetaMask for this demo.");
              }}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors" style={{ color: wallet.color }}>
                    <wallet.icon size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">{wallet.name}</div>
                    <div className="text-xs text-gray-500">{wallet.description}</div>
                  </div>
                </div>
                {loading && wallet.id === 'metamask' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                )}
                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600" />
              </button>
            ))}
          </div>

          {currentNetwork?.name === "Unsupported" && (
            <div className="text-center">
              <button onClick={() => switchNetwork(window.ethereum, 'ARC_TESTNET')} className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-colors">
                Wrong Network? Switch to Arc
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: REQUIREMENTS */}
      {activeStep === 'requirements' && (
        <div className="glass-panel p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-black text-white uppercase italic text-blue-400">02. Stipulate Requirements</h2>
              <p className="text-gray-500 text-xs mt-1">Define the forensic parameters for the AI auditor.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <a
                href={`${NETWORKS.ARC_TESTNET.explorer}/address/${deployedAddress}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-900/40 border-2 border-emerald-500/50 rounded-xl text-xs font-mono text-emerald-400 flex items-center gap-2 hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                VAULT: {deployedAddress.slice(0, 6)}...{deployedAddress.slice(-4)}
              </a>
              <div className="px-4 py-2 bg-cyan-500/10 border-2 border-cyan-500/30 rounded-xl text-xs font-black text-cyan-400 flex items-center gap-2 uppercase tracking-tighter shadow-[0_0_15px_rgba(34,211,238,0.1)]">
                <Shield size={14} className="animate-pulse" /> HALE Forensic Guard: Active
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Seller Address */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seller Address (Recipient) *</label>
              <input
                type="text"
                placeholder="0x..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:border-emerald-500/50 focus:outline-none transition-colors"
                value={formData.sellerAddress}
                onChange={e => setFormData({ ...formData, sellerAddress: e.target.value })}
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Deposit Amount (ARC) *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0.1"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:border-emerald-500/50 focus:outline-none transition-colors pl-4"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                />
                <div className="absolute right-4 top-4 text-gray-500 font-bold text-sm">ARC</div>
              </div>
            </div>

            {/* Terms */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contract Stipulations (Terms) *</label>
              <textarea
                rows={4}
                placeholder="E.g. Deliver a Python script that calculates..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
                value={formData.requirements}
                onChange={e => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>

            {/* Telegram */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Seller Telegram (Optional)</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="@username"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-white font-mono focus:border-emerald-500/50 focus:outline-none transition-colors"
                  value={formData.telegram}
                  onChange={e => setFormData({ ...formData, telegram: e.target.value })}
                />
              </div>
              <p className="mt-2 text-[10px] text-gray-500">If provided, we'll send the OTP directly to them via Telegram.</p>
            </div>

            <button
              onClick={handleDepositAndSetRequirements}
              disabled={loading}
              className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-black text-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              ) : (
                <>DEPOSIT & IGNITE <Rocket size={20} /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: COMPLETE */}
      {activeStep === 'complete' && (
        <div className="glass-panel p-10 text-center border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
          <div className="inline-flex p-4 bg-emerald-500/10 rounded-full mb-6">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>

          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Contract Active</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Funds deposited and requirements locked. The Oracle is watching.
          </p>

          {!formData.telegram && (
            <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-left">
              <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2"><ExternalLink size={16} /> Share with Seller</h3>
              <p className="text-xs text-gray-400 mb-4">You must share this submission link and the OTP (Check Backend Console or API) with the seller.</p>

              <div className="flex items-center gap-2 bg-black/40 p-3 rounded-lg border border-white/5">
                <code className="text-blue-300 text-xs truncate flex-1">{window.location.origin}{submissionLink}</code>
                <button onClick={() => copyToClipboard(`${window.location.origin}${submissionLink}`)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-gray-400" />}
                </button>
              </div>
            </div>
          )}

          {formData.telegram && (
            <div className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-left flex items-start gap-4">
              <MessageSquare className="text-emerald-500 mt-1" size={24} />
              <div>
                <h3 className="text-emerald-400 font-bold mb-1">Notification Sent</h3>
                <p className="text-sm text-gray-400">We've notified <strong>{formData.telegram}</strong> with instructions and their unique OTP.</p>
                {fundTxHash && (
                  <a
                    href={`${NETWORKS.ARC_TESTNET.explorer}/tx/${fundTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[10px] text-emerald-500/60 hover:text-emerald-400 transition-colors uppercase font-black"
                  >
                    View Fund Transaction <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Transaction Info for non-telegram as well */}
          {!formData.telegram && fundTxHash && (
            <div className="mb-4 text-center">
              <a
                href={`${NETWORKS.ARC_TESTNET.explorer}/tx/${fundTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] text-gray-500 hover:text-emerald-400 transition-colors uppercase font-black"
              >
                View Settlement Transaction <ExternalLink size={10} />
              </a>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-colors">
              New Deployment
            </button>
            <button onClick={() => window.location.href = '/monitor'} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-sm font-black text-black transition-colors flex items-center gap-2">
              Monitor Status <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Protocol Registry Footer */}
      <div className="mt-12 p-8 glass-panel border-white/5 bg-white/2">
        <div className="flex items-center gap-4 mb-8">
          <Activity size={24} className="text-secondary" />
          <h4 className="text-lg font-black text-white uppercase tracking-[0.2em]">Protocol Global Registry</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest">Solana Forensic Engine</p>
            <a href="https://explorer.solana.com/address/CnwQj2kPHpTbAvJT3ytzekrp7xd4HEtZJuEua9yn9MMe?cluster=devnet" target="_blank" rel="noreferrer"
              className="text-xs font-mono text-secondary hover:text-cyan-400 transition-colors break-all flex items-center gap-2">
              CnwQj2k...9yn9MMe <ExternalLink size={10} />
            </a>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest">Solana HALE Escrow</p>
            <a href="https://explorer.solana.com/address/BCKogk1bxSti471AAyrWu3fEBLtbrE3nrwopKZrauEu6?cluster=devnet" target="_blank" rel="noreferrer"
              className="text-xs font-mono text-secondary hover:text-cyan-400 transition-colors break-all flex items-center gap-2">
              BCKogk1...rauEu6 <ExternalLink size={10} />
            </a>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest">Arc Vault Factory</p>
            <a href="https://explorer.testnet.arc.network/address/0x4059fDf0bd9b48F4864cB3949A3c5892df0C2e70" target="_blank" rel="noreferrer"
              className="text-xs font-mono text-secondary hover:text-emerald-400 transition-colors break-all flex items-center gap-2">
              0x4059f...2e70 <ExternalLink size={10} />
            </a>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-muted font-black uppercase tracking-widest">Arc Forensic Escrow</p>
            <a href="https://explorer.testnet.arc.network/address/0x57c8a6466b097B33B3d98Ccd5D9787d426Bfb539" target="_blank" rel="noreferrer"
              className="text-xs font-mono text-secondary hover:text-emerald-400 transition-colors break-all flex items-center gap-2">
              0x57c8a...b539 <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Deployment;
