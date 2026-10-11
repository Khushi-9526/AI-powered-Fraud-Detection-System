import React, { useState } from 'react';
import { SystemConfig, Transaction, AlgorithmModel, ModelFeedback } from '../../types/fraud';
import { SystemConfiguration } from './SystemConfiguration';
import { DetectionReports } from './DetectionReports';
import { AlgorithmManagement } from './AlgorithmManagement';
import { DatabaseConsole } from './DatabaseConsole';
import { JavaSourceHub } from './JavaSourceHub';
import { Sliders, BarChart3, Cpu, Database, Coffee } from 'lucide-react';

interface Props {
  systemConfig: SystemConfig;
  transactions: Transaction[];
  models: AlgorithmModel[];
  activeModel: AlgorithmModel;
  feedbacks: ModelFeedback[];
  onSaveConfig: (config: SystemConfig) => void;
  onResetDefaults: () => void;
  onAddFeedback: (feedback: Omit<ModelFeedback, 'id' | 'timestamp'>) => void;
  onUpdateTransactionStatus: (txId: string, status: Transaction['status']) => void;
  onUpdateActiveModel: (model: AlgorithmModel) => void;
  onAddNewModel: (model: AlgorithmModel) => void;
}

export const AdminDashboard: React.FC<Props> = ({
  systemConfig,
  transactions,
  models,
  activeModel,
  feedbacks,
  onSaveConfig,
  onResetDefaults,
  onAddFeedback,
  onUpdateTransactionStatus,
  onUpdateActiveModel,
  onAddNewModel
}) => {
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'CONFIG' | 'ALGORITHM' | 'JAVA_HUB' | 'DATABASE'>('REPORTS');

  return (
    <div className="space-y-4">
      {/* Admin Sub-navigation Header */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('REPORTS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'REPORTS'
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Detection Reports</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CONFIG')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'CONFIG'
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configuration Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ALGORITHM')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'ALGORITHM'
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Algorithm Management</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('JAVA_HUB')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'JAVA_HUB'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-600 group-hover:text-amber-700" />
            <span>☕ Java Backend Hub</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DATABASE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'DATABASE'
                ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database &amp; SQL</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] font-mono text-slate-600 bg-slate-50 rounded-lg border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-amber-800">Java 21</span>
          <span className="text-slate-300">·</span>
          <span>Spring Boot 3</span>
          <span className="text-slate-300">·</span>
          <span>v{systemConfig.version}</span>
        </div>
      </div>

      {/* Render Active View */}
      {activeTab === 'REPORTS' && (
        <DetectionReports
          transactions={transactions}
          onAddFeedback={onAddFeedback}
          onUpdateTransactionStatus={onUpdateTransactionStatus}
        />
      )}

      {activeTab === 'CONFIG' && (
        <SystemConfiguration
          config={systemConfig}
          onSaveConfig={onSaveConfig}
          onResetDefaults={onResetDefaults}
        />
      )}

      {activeTab === 'ALGORITHM' && (
        <AlgorithmManagement
          models={models}
          activeModel={activeModel}
          feedbacks={feedbacks}
          transactions={transactions}
          onUpdateActiveModel={onUpdateActiveModel}
          onAddNewModel={onAddNewModel}
        />
      )}

      {activeTab === 'JAVA_HUB' && (
        <JavaSourceHub />
      )}

      {activeTab === 'DATABASE' && (
        <DatabaseConsole transactions={transactions} />
      )}
    </div>
  );
};
