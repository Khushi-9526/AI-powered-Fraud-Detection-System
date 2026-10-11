import React, { useState } from 'react';
import { Transaction, FraudAlert, SystemConfig, AlgorithmModel } from '../../types/fraud';
import { analyzeTransaction } from '../../services/fraudEngine';
import {
  BellRing,
  AlertTriangle,
  ShieldCheck,
  Ban,
  CreditCard,
  Send,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

interface Props {
  userName?: string;
  accountNumber?: string;
  alerts: FraudAlert[];
  transactions: Transaction[];
  systemConfig: SystemConfig;
  activeModel: AlgorithmModel;
  onNewTransaction: (tx: Transaction, alert?: FraudAlert) => void;
  onResolveAlert: (alertId: string, action: 'VERIFIED' | 'DISPUTED' | 'BLOCKED', note?: string) => void;
}

export const UserDashboard: React.FC<Props> = ({
  userName = 'Alexander Wright',
  accountNumber = '**** **** 4829',
  alerts,
  transactions,
  systemConfig,
  activeModel,
  onNewTransaction,
  onResolveAlert
}) => {
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'NEW_TX' | 'HISTORY'>('ALERTS');

  // Transaction form state
  const [amount, setAmount] = useState<string>('75.00');
  const [category, setCategory] = useState<string>('Online Purchase');
  const [merchant, setMerchant] = useState<string>('Apple Online Store');
  const [country, setCountry] = useState<string>('United States');
  const [city, setCity] = useState<string>('New York');
  const [deviceType, setDeviceType] = useState<'Mobile' | 'Desktop' | 'POS' | 'ATM'>('Mobile');
  const [useTorOrVPN, setUseTorOrVPN] = useState<boolean>(false);
  const [velocityBurst, setVelocityBurst] = useState<number>(1);

  // Result dialog for newly submitted transaction
  const [lastSubmittedResult, setLastSubmittedResult] = useState<{
    tx: Transaction;
    alert?: FraudAlert;
  } | null>(null);

  // Filter alerts by active status
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const userTransactions = transactions.filter(t => t.userId === 'USR-8821' || t.userName.toLowerCase() === userName.toLowerCase());

  const handleQuickScenario = (type: 'SAFE' | 'VELOCITY' | 'OFFSHORE_CRYPTO' | 'LARGE_WIRE') => {
    if (type === 'SAFE') {
      setAmount('12.50');
      setCategory('Food & Dining');
      setMerchant('Starbucks Coffee');
      setCountry('United States');
      setCity('New York');
      setDeviceType('Mobile');
      setUseTorOrVPN(false);
      setVelocityBurst(1);
    } else if (type === 'VELOCITY') {
      setAmount('45.00');
      setCategory('Online Purchase');
      setMerchant('Steam Digital Gaming');
      setCountry('United States');
      setCity('New York');
      setDeviceType('Desktop');
      setUseTorOrVPN(false);
      setVelocityBurst(6); // Exceeds threshold of 4
    } else if (type === 'OFFSHORE_CRYPTO') {
      setAmount('8900.00');
      setCategory('Crypto Exchange');
      setMerchant('Offshore Crypto Gateway Ltd');
      setCountry('Nigeria');
      setCity('Lagos');
      setDeviceType('Desktop');
      setUseTorOrVPN(true);
      setVelocityBurst(4);
    } else if (type === 'LARGE_WIRE') {
      setAmount('14500.00'); // Exceeds $5,000 ceiling
      setCategory('Offshore Escrow');
      setMerchant('Cayman Island Private Escrow');
      setCountry('Cayman Islands');
      setCity('George Town');
      setDeviceType('Desktop');
      setUseTorOrVPN(true);
      setVelocityBurst(1);
    }
  };

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) return;

    const txId = `TX-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const baseTxPayload: Omit<Transaction, 'riskScore' | 'status' | 'isFraud' | 'anomalyReasons' | 'riskBreakdown'> = {
      id: txId,
      userId: 'USR-8821',
      userName: userName,
      accountNumber: accountNumber,
      amount: numAmount,
      currency: 'USD',
      timestamp: now,
      category,
      merchantOrRecipient: merchant,
      location: {
        city,
        country,
        ip: useTorOrVPN ? '185.220.101.5 (Tor Exit Node)' : '68.192.12.84',
        flag: country === 'United States' ? '🇺🇸' : country === 'Nigeria' ? '🇳🇬' : country === 'Cayman Islands' ? '🇰🇾' : '🌐'
      },
      device: {
        type: deviceType,
        os: useTorOrVPN ? 'Linux x86_64 / Whonix' : deviceType === 'Mobile' ? 'iOS 19.1' : 'macOS Sonoma',
        browser: useTorOrVPN ? 'Tor Browser 13.5' : deviceType === 'Mobile' ? 'Safari Mobile' : 'Chrome 130',
        fingerprint: useTorOrVPN ? 'fp-anon-proxy-node' : 'fp-user-alex-iphone-16',
        isTrusted: !useTorOrVPN
      },
      velocityCount: velocityBurst
    };

    // Run AI Detection Analysis
    const detection = analyzeTransaction(baseTxPayload, systemConfig, activeModel);

    const fullTx: Transaction = {
      ...baseTxPayload,
      ...detection
    };

    let newAlert: FraudAlert | undefined = undefined;
    if (detection.isFraud || detection.status === 'FLAGGED' || detection.status === 'BLOCKED' || detection.riskScore >= 60) {
      newAlert = {
        id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
        transactionId: fullTx.id,
        userId: fullTx.userId,
        userName: fullTx.userName,
        timestamp: now,
        severity: detection.riskScore >= 80 ? 'CRITICAL' : detection.riskScore >= 60 ? 'HIGH' : 'MEDIUM',
        status: 'ACTIVE',
        title: detection.status === 'BLOCKED'
          ? `Suspicious Transaction Blocked: $${numAmount.toLocaleString()} to ${merchant}`
          : `Potential Fraud Alert: Unusual ${category} ($${numAmount.toLocaleString()})`,
        description: detection.anomalyReasons.join('. ') || 'AI scoring detected anomalous behavioral indicators.',
        riskScore: detection.riskScore,
        triggers: detection.anomalyReasons
      };
    }

    onNewTransaction(fullTx, newAlert);
    setLastSubmittedResult({ tx: fullTx, alert: newAlert });
  };

  return (
    <div className="space-y-6">
      {/* Account Header Summary */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-teal-700">
            <CreditCard className="w-4 h-4 text-teal-600" />
            <span className="font-mono font-medium">Account · {accountNumber}</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active AI Anomaly Shield
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">{userName}</h2>
          <p className="text-xs text-slate-500">
            Current Available Balance: <span className="font-mono font-bold text-emerald-600 text-sm">$24,850.00 USD</span>
          </p>
        </div>

        {/* Alerts Badge Counter */}
        <div className="flex items-center gap-3">
          {activeAlerts.length > 0 ? (
            <div className="px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 shadow-xs">
              <BellRing className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
              <div className="text-xs">
                <span className="font-bold">{activeAlerts.length} Suspicious Alert{activeAlerts.length > 1 ? 's' : ''}</span>
                <span className="text-rose-600 block text-[11px]">Action required to protect account</span>
              </div>
            </div>
          ) : (
            <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">All Transactions Clear · Zero Alerts</span>
            </div>
          )}
        </div>
      </div>

      {/* User Dashboard Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 flex items-center gap-2 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('ALERTS')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'ALERTS'
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Transaction Alerts</span>
          {activeAlerts.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-rose-600 text-white text-[10px] rounded-full font-mono font-bold">
              {activeAlerts.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('NEW_TX')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'NEW_TX'
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Make Transaction (Simulator)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>My Transaction History</span>
        </button>
      </div>

      {/* TAB 1: TRANSACTION ALERTS */}
      {activeTab === 'ALERTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-rose-600" />
                Suspicious Transaction Alerts
              </h3>
              <p className="text-xs text-slate-500">
                Notifies users of suspicious transactions detected by machine learning anomaly models.
              </p>
            </div>
            <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 font-semibold">
              {alerts.length} Total Alerts ({activeAlerts.length} Active)
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2 shadow-xs">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900">No Suspicious Activity Detected</h4>
              <p className="text-xs text-slate-500">Your account is fully secured. All recent transactions match your regular spending behavior.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => {
                const isCritical = alert.severity === 'CRITICAL';
                const isResolved = alert.status !== 'ACTIVE';

                return (
                  <div
                    key={alert.id}
                    className={`p-6 rounded-2xl border transition-all ${
                      isResolved
                        ? 'bg-slate-50 border-slate-200 opacity-80'
                        : isCritical
                        ? 'bg-rose-50/70 border-rose-200 shadow-xs'
                        : 'bg-amber-50/70 border-amber-200 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                            isCritical
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-white'
                          }`}>
                            {alert.severity} RISK
                          </span>
                          <span className="text-xs font-mono text-slate-400">Alert ID: {alert.id}</span>
                          <span className="text-xs text-slate-300">·</span>
                          <span className="text-xs text-slate-500 font-medium">{alert.timestamp}</span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 pt-1">
                          {alert.title}
                        </h4>
                        <p className="text-xs text-slate-600">
                          {alert.description}
                        </p>
                      </div>

                      {/* AI Risk Score Badge */}
                      <div className="sm:text-right shrink-0">
                        <div className="text-[10px] uppercase font-semibold text-slate-400">AI Risk Score</div>
                        <div className={`text-xl font-bold font-mono ${
                          alert.riskScore >= 80 ? 'text-rose-600' : 'text-amber-600'
                        }`}>
                          {alert.riskScore}/100
                        </div>
                      </div>
                    </div>

                    {/* Detected Anomaly Triggers */}
                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Anomaly Indicators Flagged:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {alert.triggers.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 text-slate-700 rounded-lg shadow-xs font-medium"
                          >
                            ⚠️ {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* User Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-slate-600 font-medium">
                        {isResolved ? (
                          <span className="text-emerald-700 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Resolved ({alert.status})
                          </span>
                        ) : (
                          <span>Did you initiate this transaction?</span>
                        )}
                      </div>

                      {!isResolved && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onResolveAlert(alert.id, 'VERIFIED')}
                            className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            I Recognize This (Verify)
                          </button>
                          <button
                            type="button"
                            onClick={() => onResolveAlert(alert.id, 'BLOCKED')}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            Dispute & Lock Card
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MAKE TRANSACTION */}
      {activeTab === 'NEW_TX' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-teal-600" />
                  Perform Financial Transaction
                </h3>
                <p className="text-xs text-slate-500">
                  Transactions are inspected in real time by AI anomaly models and threshold rules.
                </p>
              </div>

              {/* Quick Scenarios */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Scenarios:</span>
                <button
                  type="button"
                  onClick={() => handleQuickScenario('SAFE')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                >
                  Coffee (Safe)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickScenario('VELOCITY')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-800 rounded-lg border border-amber-200 hover:bg-amber-100"
                >
                  Velocity Burst
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickScenario('OFFSHORE_CRYPTO')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-800 rounded-lg border border-rose-200 hover:bg-rose-100"
                >
                  Offshore Crypto
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickScenario('LARGE_WIRE')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-cyan-50 text-cyan-800 rounded-lg border border-cyan-200 hover:bg-cyan-100"
                >
                  Limit Exceeded
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitTransaction} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Amount */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Transaction Amount ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full pl-6 pr-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white font-medium"
                  >
                    <option value="Online Purchase">Online Purchase (E-Commerce)</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Utilities & Bills">Utilities & Bills</option>
                    <option value="Crypto Exchange">Crypto Exchange (High-Risk)</option>
                    <option value="Peer-to-Peer Wire">Peer-to-Peer Wire</option>
                    <option value="ATM Cash">ATM Cash Withdrawal</option>
                    <option value="Offshore Escrow">Offshore Escrow (High-Risk)</option>
                  </select>
                </div>

                {/* Merchant / Recipient */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Merchant / Recipient Name
                  </label>
                  <input
                    type="text"
                    required
                    value={merchant}
                    onChange={e => setMerchant(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white font-medium"
                  />
                </div>

                {/* Country */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Destination / Origin Country
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white font-medium"
                  />
                </div>

                {/* City */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white font-medium"
                  />
                </div>

                {/* Device Type */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Device Channel
                  </label>
                  <select
                    value={deviceType}
                    onChange={e => setDeviceType(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white font-medium"
                  >
                    <option value="Mobile">Mobile App (Authorized iPhone)</option>
                    <option value="Desktop">Desktop Browser</option>
                    <option value="POS">In-Store POS Terminal</option>
                    <option value="ATM">ATM Terminal</option>
                  </select>
                </div>
              </div>

              {/* Simulation flags */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={useTorOrVPN}
                      onChange={e => setUseTorOrVPN(e.target.checked)}
                      className="rounded accent-teal-600"
                    />
                    <span>Simulate Tor / VPN Proxy Anonymizer (Hostile Environment)</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Simulate Velocity Count (tx in 5m):</span>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={velocityBurst}
                    onChange={e => setVelocityBurst(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-xs font-mono bg-white border border-slate-200 rounded-lg text-center text-slate-900"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-xl transition-all flex items-center gap-2 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  Execute Transaction & Inspect with AI
                </button>
              </div>
            </form>
          </div>

          {/* Submission Feedback Banner */}
          {lastSubmittedResult && (
            <div className={`p-5 rounded-2xl border shadow-sm animate-in fade-in duration-300 ${
              lastSubmittedResult.tx.status === 'APPROVED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : lastSubmittedResult.tx.status === 'BLOCKED'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {lastSubmittedResult.tx.status === 'APPROVED' ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  ) : lastSubmittedResult.tx.status === 'BLOCKED' ? (
                    <Ban className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">
                        {lastSubmittedResult.tx.status === 'APPROVED'
                          ? 'Transaction Successfully Approved & Processed'
                          : lastSubmittedResult.tx.status === 'BLOCKED'
                          ? 'Transaction Blocked Immediately: Fraud Alert Triggered'
                          : 'Transaction Challenged: Security Review Required'}
                      </span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-black/5 border border-black/10 font-semibold">
                        {lastSubmittedResult.tx.id}
                      </span>
                    </div>

                    <p className="text-xs">
                      Payment of <strong>${lastSubmittedResult.tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> to <strong>{lastSubmittedResult.tx.merchantOrRecipient}</strong>
                    </p>

                    {lastSubmittedResult.tx.anomalyReasons.length > 0 && (
                      <div className="pt-2 space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-700">
                          AI Anomaly Reasons Flagged:
                        </span>
                        <ul className="text-xs list-disc list-inside space-y-0.5 font-medium">
                          {lastSubmittedResult.tx.anomalyReasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase font-semibold text-slate-500">AI Risk Score</div>
                  <div className="text-2xl font-bold font-mono">
                    {lastSubmittedResult.tx.riskScore}/100
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER TRANSACTION HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Account Transaction History
            </h3>
            <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 font-semibold">
              {userTransactions.length} Logged Transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">Transaction ID</th>
                  <th className="py-2.5 px-4">Merchant / Beneficiary</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4">AI Score</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{t.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{t.merchantOrRecipient}</td>
                    <td className="py-3 px-4 text-slate-500">{t.category}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {t.location.flag} {t.location.city}, {t.location.country}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={
                        t.riskScore >= 70 ? 'text-rose-600' :
                        t.riskScore >= 35 ? 'text-amber-600' : 'text-emerald-600'
                      }>
                        {t.riskScore}/100
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        t.status === 'BLOCKED' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{t.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
