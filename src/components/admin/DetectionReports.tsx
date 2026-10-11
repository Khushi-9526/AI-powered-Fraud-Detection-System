import React, { useState } from 'react';
import { Transaction, ModelFeedback } from '../../types/fraud';
import {
  CategoryBarChart,
  RiskDistributionHistogram,
  FraudTrendTimeline
} from '../charts/FraudCharts';
import {
  FileText,
  Search,
  Download,
  AlertTriangle,
  ShieldCheck,
  Ban,
  ChevronRight,
  X,
  TrendingDown,
  DollarSign,
  ShieldAlert,
  Activity,
  CheckCircle2
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onAddFeedback: (feedback: Omit<ModelFeedback, 'id' | 'timestamp'>) => void;
  onUpdateTransactionStatus: (txId: string, status: Transaction['status']) => void;
}

export const DetectionReports: React.FC<Props> = ({
  transactions,
  onAddFeedback,
  onUpdateTransactionStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'BLOCKED' | 'FLAGGED' | 'CHALLENGED'>('ALL');
  const [selectedCase, setSelectedCase] = useState<Transaction | null>(null);
  const [investigatorNote, setInvestigatorNote] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter fraud cases
  const fraudCases = transactions.filter(t => t.isFraud || t.status === 'FLAGGED' || t.status === 'BLOCKED' || t.riskScore >= 50);

  const filteredCases = fraudCases.filter(c => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.merchantOrRecipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ? true : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Analytics Metrics
  const totalPreventedCapital = fraudCases.reduce((sum, c) => sum + c.amount, 0);
  const totalTransactionsCount = transactions.length;
  const fraudRate = totalTransactionsCount > 0
    ? ((fraudCases.length / totalTransactionsCount) * 100).toFixed(1)
    : '0';

  const handleCaseAction = (verdict: 'CONFIRMED_FRAUD' | 'FALSE_POSITIVE', newStatus: Transaction['status']) => {
    if (!selectedCase) return;

    onAddFeedback({
      caseId: `CASE-${selectedCase.id.replace('TX-', '')}`,
      transactionId: selectedCase.id,
      originalRiskScore: selectedCase.riskScore,
      adminVerdict: verdict,
      notes: investigatorNote.trim() || (verdict === 'CONFIRMED_FRAUD' ? 'Confirmed fraudulent activity by compliance officer.' : 'Dismissed as legitimate user behavior; feedback logged for algorithm refinement.')
    });

    onUpdateTransactionStatus(selectedCase.id, newStatus);

    setActionNotice(`Case ${selectedCase.id} marked as ${verdict === 'CONFIRMED_FRAUD' ? 'Confirmed Fraud' : 'False Positive'} and routed to the Algorithm Retraining Pipeline.`);
    setSelectedCase(null);
    setInvestigatorNote('');

    setTimeout(() => {
      setActionNotice(null);
    }, 5000);
  };

  const handleExportCSV = () => {
    const headers = 'Case_ID,User_Name,Account,Amount,Currency,Timestamp,Category,Merchant,City,Country,Risk_Score,Status,Triggers\n';
    const rows = filteredCases.map(c => 
      `"${c.id}","${c.userName}","${c.accountNumber}","${c.amount}","${c.currency}","${c.timestamp}","${c.category}","${c.merchantOrRecipient}","${c.location.city}","${c.location.country}","${c.riskScore}","${c.status}","${c.anomalyReasons.join(' | ')}"`
    );
    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraud-detection-report-${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Notice Bar */}
      {actionNotice && (
        <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-2xl text-teal-900 text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Detected Fraud Cases</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {fraudCases.length}
            </span>
            <span className="text-xs text-rose-600 font-semibold">
              ({fraudRate}% of total)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Monitored transactions: {totalTransactionsCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Prevented Loss Exposure</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              ${totalPreventedCapital.toLocaleString(undefined, { minimumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">Saved</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Blocked prior to settlement</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Critical Anomaly Rate</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {fraudCases.filter(c => c.riskScore >= 75).length}
            </span>
            <span className="text-xs text-amber-600 font-semibold">Score &ge; 75</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requiring immediate containment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Inspection Engine Velocity</span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              14.2 ms
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Real-time</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero edge-gateway latency</p>
        </div>
      </div>

      {/* GRAPHICAL REPRESENTATION OF DETECTED FRAUD CASES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Detection Reports & Graphical Analytics
            </h3>
            <p className="text-xs text-slate-500">Visual representations of detected fraud patterns, risk scores, and time vectors</p>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            Export CSV Report
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart 1: Category Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <CategoryBarChart transactions={transactions} />
          </div>

          {/* Chart 2: Risk Distribution Histogram */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <RiskDistributionHistogram transactions={transactions} />
          </div>

          {/* Chart 3: Timeline Trend */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <FraudTrendTimeline transactions={transactions} />
          </div>
        </div>
      </div>

      {/* DETECTED FRAUD CASES TABLE & DETAILED REPORT VIEWER */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by case ID, user, merchant, city..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
            />
          </div>

          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(['ALL', 'BLOCKED', 'FLAGGED', 'CHALLENGED'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  statusFilter === s
                    ? 'bg-white text-teal-700 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'ALL' ? 'All Cases' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Case / Tx ID</th>
                <th className="py-3 px-4">User & Account</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Merchant & Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">AI Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No fraud cases matching current search criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map(c => {
                  const isBlocked = c.status === 'BLOCKED';
                  const isFlagged = c.status === 'FLAGGED';

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedCase(c)}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {c.id}
                        <div className="text-[10px] text-slate-400 font-sans">{c.timestamp.substring(11, 19)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{c.userName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{c.accountNumber}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        ${c.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 truncate max-w-[160px]">
                          {c.merchantOrRecipient}
                        </div>
                        <div className="text-[11px] text-slate-500">{c.category}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span>{c.location.flag}</span>
                          <span className="text-slate-700">{c.location.city}, {c.location.country}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.location.ip}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm ${
                            c.riskScore >= 75 ? 'text-rose-600' :
                            c.riskScore >= 40 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                            {c.riskScore}/100
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                          isBlocked
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isFlagged
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCase(c);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <span>Review Report</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED INVESTIGATION REPORT DRAWER / MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-7 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                    {selectedCase.id}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    selectedCase.status === 'BLOCKED' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {selectedCase.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Detailed Fraud Investigation Report
                </h3>
                <p className="text-xs text-slate-500">
                  Detected at {selectedCase.timestamp} · Target Account {selectedCase.accountNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Transaction Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Transaction Value</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  ${selectedCase.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">AI Anomaly Score</span>
                <span className={`text-base font-bold font-mono ${
                  selectedCase.riskScore >= 75 ? 'text-rose-600' : 'text-amber-600'
                }`}>
                  {selectedCase.riskScore} / 100
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Origin Country</span>
                <span className="text-xs font-semibold text-slate-800 truncate block">
                  {selectedCase.location.flag} {selectedCase.location.country}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">Device Category</span>
                <span className="text-xs font-semibold text-slate-800 truncate block">
                  {selectedCase.device.type} ({selectedCase.device.browser.split(' ')[0]})
                </span>
              </div>
            </div>

            {/* Triggered Anomaly Explanations */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                Detected Anomalies & Rule Violations
              </h4>
              <div className="space-y-1.5">
                {selectedCase.anomalyReasons.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hard rule violations recorded.</p>
                ) : (
                  selectedCase.anomalyReasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Feature Risk Factor Vector Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Machine Learning Anomaly Vector Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries(selectedCase.riskBreakdown).map(([factor, score]) => (
                  <div key={factor} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="capitalize font-medium text-slate-700">
                        {factor.replace('Risk', '')}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          score > 70 ? 'bg-rose-500' : score > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Investigation Metadata */}
            <div className="p-3 bg-slate-50 text-slate-700 rounded-xl font-mono text-[11px] space-y-1 border border-slate-200">
              <div><span className="text-slate-400">User:</span> {selectedCase.userName} ({selectedCase.userId})</div>
              <div><span className="text-slate-400">Beneficiary:</span> {selectedCase.merchantOrRecipient}</div>
              <div><span className="text-slate-400">Device Fingerprint:</span> {selectedCase.device.fingerprint}</div>
              <div><span className="text-slate-400">IP Routing:</span> {selectedCase.location.ip} ({selectedCase.location.city}, {selectedCase.location.country})</div>
            </div>

            {/* Investigator Action Form */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Investigator Action & ML Feedback Note
              </label>
              <textarea
                rows={2}
                placeholder="Optional note for training dataset (e.g. Verified legitimate customer / Stolen credentials verified)..."
                value={investigatorNote}
                onChange={e => setInvestigatorNote(e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
              />

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleCaseAction('FALSE_POSITIVE', 'APPROVED')}
                  className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Dismiss as False Positive (Feedback Loop)
                </button>
                <button
                  type="button"
                  onClick={() => handleCaseAction('CONFIRMED_FRAUD', 'BLOCKED')}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Confirm Fraud & Lock Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
