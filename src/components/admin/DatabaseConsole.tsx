import React, { useState } from 'react';
import { DATABASE_SCHEMA, INITIAL_TRAINING_DATASET } from '../../services/fraudEngine';
import { Transaction } from '../../types/fraud';
import {
  Database,
  Terminal,
  Play,
  Table,
  CheckCircle2,
  FileCode2,
  Download,
  Server,
  Layers,
  Code2
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export const DatabaseConsole: React.FC<Props> = ({ transactions }) => {
  const [selectedTable, setSelectedTable] = useState<string>('transactions');
  const [sqlQuery, setSqlQuery] = useState<string>(
    'SELECT id, user_name, amount, category, location_city, risk_score, status FROM transactions WHERE risk_score >= 50 ORDER BY amount DESC LIMIT 10;'
  );
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryExecutionTime, setQueryExecutionTime] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      // Simulate query execution against the in-memory transactional database
      let results: any[] = [];
      const lower = sqlQuery.toLowerCase();

      if (lower.includes('transactions')) {
        results = transactions.map(t => ({
          id: t.id,
          user_name: t.userName,
          account: t.accountNumber,
          amount: `$${t.amount.toFixed(2)}`,
          category: t.category,
          merchant: t.merchantOrRecipient,
          location_city: t.location.city,
          risk_score: `${t.riskScore}/100`,
          is_fraud: t.isFraud ? '1 (TRUE)' : '0 (FALSE)',
          status: t.status
        }));

        if (lower.includes('risk_score >= 50') || lower.includes('fraud')) {
          results = results.filter(r => parseInt(r.risk_score) >= 50);
        }
      } else if (lower.includes('fraud_alerts')) {
        results = transactions.filter(t => t.riskScore >= 60).map((t, idx) => ({
          alert_id: `ALT-${1080 + idx}`,
          transaction_id: t.id,
          user_name: t.userName,
          severity: t.riskScore >= 80 ? 'CRITICAL' : 'HIGH',
          status: 'ACTIVE',
          risk_score: t.riskScore,
          triggers: t.anomalyReasons.slice(0, 2).join('; ')
        }));
      } else {
        results = transactions.slice(0, 5).map(t => ({
          id: t.id,
          amount: t.amount,
          status: t.status
        }));
      }

      setQueryResult(results);
      setQueryExecutionTime(Math.floor(4 + Math.random() * 8));
      setIsExecuting(false);
    }, 300);
  };

  const handlePredefinedQuery = (query: string) => {
    setSqlQuery(query);
  };

  const activeSchema = DATABASE_SCHEMA.find(s => s.name === selectedTable) || DATABASE_SCHEMA[0];

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Database & DAO Console (fraud_detection.sql)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Direct interface to the persistence layer (TransactionDAO.java, DBConnection.java, and relational schema).
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono">
          <Server className="w-3.5 h-3.5 text-emerald-600" />
          <span>JDBC Connection Pool: Online (Active Pool: 10)</span>
        </div>
      </div>

      {/* Schema Navigation & SQL Table Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {DATABASE_SCHEMA.map(table => (
          <button
            key={table.name}
            type="button"
            onClick={() => {
              setSelectedTable(table.name);
              handlePredefinedQuery(`SELECT * FROM ${table.name} LIMIT 10;`);
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedTable === table.name
                ? 'bg-white border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-teal-600" />
                {table.name}
              </span>
              <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {table.rowCount} rows
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2">{table.description}</p>
          </button>
        ))}
      </div>

      {/* SQL Query Editor & Terminal */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-teal-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Interactive SQL Query Runner (JDBC Executor)
            </h4>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Predefined queries:</span>
            <button
              type="button"
              onClick={() => handlePredefinedQuery('SELECT * FROM transactions WHERE is_fraud = 1 ORDER BY amount DESC;')}
              className="px-2 py-0.8 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
            >
              Fraud Cases
            </button>
            <button
              type="button"
              onClick={() => handlePredefinedQuery('SELECT category, count(*), sum(amount) FROM transactions GROUP BY category;')}
              className="px-2 py-0.8 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
            >
              Category Aggregation
            </button>
            <button
              type="button"
              onClick={() => handlePredefinedQuery('SELECT * FROM fraud_alerts WHERE severity = "CRITICAL";')}
              className="px-2 py-0.8 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
            >
              Critical Alerts
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <textarea
            rows={3}
            value={sqlQuery}
            onChange={e => setSqlQuery(e.target.value)}
            className="w-full p-3 font-mono text-xs bg-slate-900 text-teal-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 selection:bg-teal-500 selection:text-slate-900"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400 font-mono">
              Driver: com.mysql.cj.jdbc.Driver · Database: fraud_detection_db
            </span>
            <button
              type="button"
              onClick={handleRunQuery}
              disabled={isExecuting}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isExecuting ? 'Executing Query...' : 'Execute SQL'}</span>
            </button>
          </div>
        </div>

        {/* Query Result Table */}
        {queryResult && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Query OK: {queryResult.length} rows returned
              </span>
              <span>Execution Time: {queryExecutionTime} ms</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-72">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    {Object.keys(queryResult[0] || {}).map(col => (
                      <th key={col} className="py-2 px-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {queryResult.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      {Object.values(row).map((val: any, colIdx) => (
                        <td key={colIdx} className="py-2 px-3 truncate max-w-xs">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* DDL Schema Viewer */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-teal-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Active Schema Definition: table `{activeSchema.name}`
            </h4>
          </div>
          <span className="text-xs font-mono text-slate-400">fraud_detection.sql</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Column Name</th>
                <th className="py-2 px-3">Data Type</th>
                <th className="py-2 px-3">Constraints / Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {activeSchema.columns.map((col, i) => (
                <tr key={i}>
                  <td className="py-2 px-3 font-bold text-slate-900">{col.name}</td>
                  <td className="py-2 px-3 text-teal-700">{col.type}</td>
                  <td className="py-2 px-3 text-slate-500">{col.key || 'NULL'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
