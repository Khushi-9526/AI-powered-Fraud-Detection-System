import React from 'react';
import { Transaction, ConfusionMatrix } from '../../types/fraud';

interface CategoryChartProps {
  transactions: Transaction[];
}

export const CategoryBarChart: React.FC<CategoryChartProps> = ({ transactions }) => {
  const fraudTxs = transactions.filter(t => t.isFraud || t.status === 'FLAGGED' || t.status === 'BLOCKED');
  
  // Aggregate by category
  const categoryCounts: { [cat: string]: { count: number; totalAmount: number } } = {};
  fraudTxs.forEach(tx => {
    if (!categoryCounts[tx.category]) {
      categoryCounts[tx.category] = { count: 0, totalAmount: 0 };
    }
    categoryCounts[tx.category].count += 1;
    categoryCounts[tx.category].totalAmount += tx.amount;
  });

  const categories = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    count: categoryCounts[cat].count,
    amount: categoryCounts[cat].totalAmount
  })).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...categories.map(c => c.count), 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Fraud Cases by Category</h4>
          <p className="text-xs text-slate-600 font-medium">Distribution of anomalies across merchant sectors</p>
        </div>
        <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-semibold">
          {fraudTxs.length} Flagged
        </span>
      </div>

      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No flagged cases recorded</div>
        ) : (
          categories.map((cat, idx) => {
            const pct = Math.round((cat.count / maxCount) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{cat.name}</span>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="font-mono text-slate-600">${cat.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span>
                    <span className="font-semibold text-rose-600">{cat.count} {cat.count === 1 ? 'case' : 'cases'}</span>
                  </div>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-rose-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(8, pct)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const RiskDistributionHistogram: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const bins = [
    { label: '0-25 (Low/Safe)', count: 0, color: 'bg-emerald-500', barColor: '#10B981' },
    { label: '26-50 (Guarded)', count: 0, color: 'bg-teal-500', barColor: '#0D9488' },
    { label: '51-75 (Challenged)', count: 0, color: 'bg-amber-500', barColor: '#F59E0B' },
    { label: '76-100 (Critical)', count: 0, color: 'bg-rose-500', barColor: '#E11D48' }
  ];

  transactions.forEach(t => {
    if (t.riskScore <= 25) bins[0].count++;
    else if (t.riskScore <= 50) bins[1].count++;
    else if (t.riskScore <= 75) bins[2].count++;
    else bins[3].count++;
  });

  const maxBinCount = Math.max(...bins.map(b => b.count), 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Risk Score Density (0 - 100)</h4>
          <p className="text-xs text-slate-600 font-medium">Frequency breakdown across AI anomaly spectrum</p>
        </div>
        <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-semibold">
          {transactions.length} Samples
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-4 items-end h-40 border-b border-slate-200">
        {bins.map((bin, i) => {
          const heightPct = Math.round((bin.count / maxBinCount) * 100);
          return (
            <div key={i} className="flex flex-col items-center h-full justify-end group">
              <span className="text-xs font-mono font-bold text-slate-800 mb-1 group-hover:scale-110 transition-transform">
                {bin.count}
              </span>
              <div className="w-full max-w-[48px] bg-slate-100 rounded-t-md h-full flex items-end overflow-hidden">
                <div
                  className="w-full rounded-t-md transition-all duration-700 shadow-xs"
                  style={{
                    height: `${Math.max(6, heightPct)}%`,
                    backgroundColor: bin.barColor
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-2 mt-2 text-center">
        {bins.map((bin, i) => (
          <span key={i} className="text-[11px] text-slate-700 font-semibold leading-tight block truncate">
            {bin.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export const FraudTrendTimeline: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  const currentTotal = transactions.length;
  const currentFraud = transactions.filter(t => t.isFraud || t.status === 'BLOCKED' || t.status === 'FLAGGED').length;

  const timeBuckets = [
    { time: '02:00', total: 12, fraud: 0 },
    { time: '04:00', total: 8, fraud: 0 },
    { time: '06:00', total: 14, fraud: 1 },
    { time: '08:00', total: 29, fraud: 0 },
    { time: '10:00', total: 42, fraud: 2 },
    { time: '12:00', total: 58, fraud: 3 },
    { time: '14:00', total: 64, fraud: 4 },
    { time: '16:00', total: 51, fraud: 1 },
    { time: '18:00', total: 49, fraud: 2 },
    { time: '20:00', total: 60, fraud: 3 },
    { time: '22:00', total: 38, fraud: 2 },
    { time: 'Live', total: Math.max(currentTotal, 25), fraud: currentFraud }
  ];

  const maxTotal = Math.max(...timeBuckets.map(b => b.total), 70);

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Transaction Volume vs Anomaly</h4>
          <p className="text-xs text-slate-600 font-medium">24-hour velocity distribution and detected anomalous surges</p>
        </div>
        <div className="flex items-center gap-3 text-xs shrink-0">
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-xs bg-teal-600" /> Normal Volume
          </span>
          <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
            <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Flagged Fraud
          </span>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative h-48 w-full pt-6 pb-1 border-b border-slate-200">
        <div className="h-full w-full flex items-end gap-1 sm:gap-2">
          {timeBuckets.map((bucket, idx) => {
            // Stacked bar heights safely calculated
            const totalPct = Math.min(100, Math.max(12, Math.round((bucket.total / maxTotal) * 100)));
            const fraudRatio = bucket.total > 0 ? bucket.fraud / bucket.total : 0;
            const fraudPctOfBar = Math.min(100, Math.round(fraudRatio * 100));

            return (
              <div
                key={idx}
                className="flex-1 min-w-0 flex flex-col items-center h-full justify-end relative group cursor-pointer"
              >
                {/* Clean hover tooltip that stays inside layout */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded-md shadow-lg pointer-events-none z-30 whitespace-nowrap">
                  {bucket.time}: {bucket.total} total · {bucket.fraud} fraud
                </div>

                {/* Fraud count pill above bar if fraud > 0 */}
                {bucket.fraud > 0 && (
                  <span className="text-[10px] font-mono font-bold text-rose-600 mb-1 leading-none">
                    {bucket.fraud}
                  </span>
                )}

                {/* Stacked bar container */}
                <div
                  className="w-full max-w-[42px] bg-slate-100 rounded-t-md overflow-hidden flex flex-col justify-end transition-all duration-300"
                  style={{ height: `${totalPct}%` }}
                >
                  {/* Top segment: Normal Volume */}
                  <div
                    className="w-full bg-teal-600/80 group-hover:bg-teal-600 transition-colors"
                    style={{ height: `${100 - fraudPctOfBar}%` }}
                  />

                  {/* Bottom segment: Flagged Fraud */}
                  {fraudPctOfBar > 0 && (
                    <div
                      className="w-full bg-rose-500 group-hover:bg-rose-600 transition-colors"
                      style={{ height: `${fraudPctOfBar}%` }}
                    />
                  )}
                </div>

                {/* Time label */}
                <span className="text-[11px] text-slate-700 font-mono mt-1.5 font-semibold truncate w-full text-center block">
                  {bucket.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ConfusionMatrixDisplay: React.FC<{ matrix: ConfusionMatrix }> = ({ matrix }) => {
  return (
    <div className="p-4 bg-slate-50 text-slate-900 rounded-2xl border border-slate-200 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Confusion Matrix (Validation Partition)
        </h5>
        <span className="text-[11px] text-emerald-700 font-mono font-semibold">
          Total Validated: {(matrix.truePositive + matrix.falsePositive + matrix.trueNegative + matrix.falseNegative).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
        <div className="p-2 text-slate-500 font-medium">Actual \ Predicted</div>
        <div className="p-2 bg-white font-semibold text-slate-700 rounded-lg border border-slate-200">Predicted Fraud</div>
        <div className="p-2 bg-white font-semibold text-slate-700 rounded-lg border border-slate-200">Predicted Safe</div>

        <div className="p-2 bg-white font-semibold text-slate-700 rounded-lg border border-slate-200 flex items-center justify-center">
          Actual Fraud
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl shadow-xs">
          <div className="text-base font-bold text-emerald-800 font-mono">{matrix.truePositive.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-700 font-semibold uppercase">True Positive (TP)</div>
        </div>
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl shadow-xs">
          <div className="text-base font-bold text-rose-800 font-mono">{matrix.falseNegative.toLocaleString()}</div>
          <div className="text-[10px] text-rose-700 font-semibold uppercase">False Negative (FN)</div>
        </div>

        <div className="p-2 bg-white font-semibold text-slate-700 rounded-lg border border-slate-200 flex items-center justify-center">
          Actual Safe
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl shadow-xs">
          <div className="text-base font-bold text-amber-800 font-mono">{matrix.falsePositive.toLocaleString()}</div>
          <div className="text-[10px] text-amber-700 font-semibold uppercase">False Positive (FP)</div>
        </div>
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl shadow-xs">
          <div className="text-base font-bold text-teal-800 font-mono">{matrix.trueNegative.toLocaleString()}</div>
          <div className="text-[10px] text-teal-700 font-semibold uppercase">True Negative (TN)</div>
        </div>
      </div>
    </div>
  );
};
