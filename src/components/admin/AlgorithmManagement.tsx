import React, { useState } from 'react';
import { AlgorithmModel, ModelFeedback, Transaction } from '../../types/fraud';
import { ConfusionMatrixDisplay } from '../charts/FraudCharts';
import { retrainModel } from '../../services/fraudEngine';
import {
  Cpu,
  RefreshCw,
  Sliders,
  CheckCircle2,
  History,
  FileCheck2,
  ArrowUpRight
} from 'lucide-react';

interface Props {
  models: AlgorithmModel[];
  activeModel: AlgorithmModel;
  feedbacks: ModelFeedback[];
  transactions: Transaction[];
  onUpdateActiveModel: (model: AlgorithmModel) => void;
  onAddNewModel: (model: AlgorithmModel) => void;
}

export const AlgorithmManagement: React.FC<Props> = ({
  models,
  activeModel,
  feedbacks,
  transactions,
  onUpdateActiveModel,
  onAddNewModel
}) => {
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccessBanner, setRetrainSuccessBanner] = useState<{
    version: string;
    delta: { accuracy: number; recall: number; f1: number };
  } | null>(null);

  // Hyperparameters local state for active model refinement
  const [hyperparams, setHyperparams] = useState(activeModel.hyperparameters);
  const [paramUpdateNotice, setParamUpdateNotice] = useState(false);

  const handleRetrain = () => {
    setIsRetraining(true);

    setTimeout(() => {
      const { updatedModel, performanceDelta } = retrainModel(
        {
          ...activeModel,
          hyperparameters: hyperparams
        },
        feedbacks,
        transactions
      );

      onAddNewModel(updatedModel);
      onUpdateActiveModel(updatedModel);
      setIsRetraining(false);
      setRetrainSuccessBanner({
        version: updatedModel.version,
        delta: performanceDelta
      });

      setTimeout(() => {
        setRetrainSuccessBanner(null);
      }, 8000);
    }, 1200);
  };

  const handleSaveHyperparameters = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...activeModel,
      hyperparameters: hyperparams,
      lastRetrained: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
    };
    onUpdateActiveModel(updated);
    setParamUpdateNotice(true);
    setTimeout(() => setParamUpdateNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Output: Updated Detection Algorithms Confirmation Banner */}
      {retrainSuccessBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 flex items-start gap-3 shadow-xs animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-900">
              Output: Updated Detection Algorithm Successfully Deployed
            </h4>
            <p className="text-xs text-emerald-800">
              The fraud detection engine has incorporated {feedbacks.length} investigative feedback verdicts and {transactions.length} live transaction vectors. Model version <strong>{retrainSuccessBanner.version}</strong> is now hot-loaded in active gateway inspection.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-emerald-700">
              <span className="flex items-center gap-1">
                Accuracy: +{retrainSuccessBanner.delta.accuracy}%
                <ArrowUpRight className="w-3 h-3 text-emerald-600" />
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                Recall: +{retrainSuccessBanner.delta.recall}%
                <ArrowUpRight className="w-3 h-3 text-emerald-600" />
              </span>
              <span>·</span>
              <span>F1 Score: +{retrainSuccessBanner.delta.f1}</span>
            </div>
          </div>
        </div>
      )}

      {paramUpdateNotice && (
        <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-teal-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>Hyperparameters updated for {activeModel.name}. Changes applied to decision tree estimators.</span>
        </div>
      )}

      {/* Header and Retrain Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Algorithm Management & Refinement
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Refine machine learning fraud detection algorithms based on system performance data and investigator feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRetrain}
          disabled={isRetraining}
          className="px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetraining ? 'animate-spin' : ''}`} />
          {isRetraining ? 'Retraining Algorithm Pipeline...' : 'Refine & Retrain Algorithm with Feedback'}
        </button>
      </div>

      {/* ACTIVE MODEL PERFORMANCE METRICS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold uppercase tracking-wider">
                Active in Production
              </span>
              <h4 className="text-sm font-bold text-slate-900">{activeModel.name}</h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{activeModel.description}</p>
          </div>
          <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 font-semibold">
            Last Retrained: {activeModel.lastRetrained}
          </span>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-600 block">Overall Accuracy</span>
            <span className="text-xl font-bold font-mono text-emerald-600">
              {activeModel.accuracy}%
            </span>
            <span className="text-[11px] text-slate-600 font-medium block mt-0.5">Tested on 47.3k tx</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-600 block">Precision</span>
            <span className="text-xl font-bold font-mono text-teal-700">
              {activeModel.precision}%
            </span>
            <span className="text-[11px] text-slate-600 font-medium block mt-0.5">True fraud positive</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-600 block">Recall (Sensitivity)</span>
            <span className="text-xl font-bold font-mono text-cyan-700">
              {activeModel.recall}%
            </span>
            <span className="text-[11px] text-slate-600 font-medium block mt-0.5">Fraud caught ratio</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-600 block">F1 Harmonic Score</span>
            <span className="text-xl font-bold font-mono text-slate-900">
              {activeModel.f1Score}
            </span>
            <span className="text-[11px] text-slate-600 font-medium block mt-0.5">Precision-recall bal</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] uppercase font-semibold text-slate-600 block">False Positive Rate</span>
            <span className="text-xl font-bold font-mono text-rose-600">
              {activeModel.falsePositiveRate}%
            </span>
            <span className="text-[11px] text-slate-600 font-medium block mt-0.5">User friction level</span>
          </div>
        </div>

        {/* Confusion Matrix Visualizer */}
        <div className="pt-2">
          <ConfusionMatrixDisplay matrix={activeModel.confusionMatrix} />
        </div>
      </div>

      {/* INPUT: FEEDBACK LOG & RECENT INVESTIGATION DATA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Feedback loop data */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-teal-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Input: Investigator Feedback & Ground Truth Data
              </h4>
            </div>
            <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-semibold">
              {feedbacks.length} Logged Items
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Supervised feedback labels supplied by compliance officers are fed into the continuous retraining pipeline.
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {feedbacks.map(fb => (
              <div
                key={fb.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-slate-800">
                    {fb.transactionId} · {fb.caseId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      fb.adminVerdict === 'CONFIRMED_FRAUD'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {fb.adminVerdict.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">{fb.notes}</p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Original Risk Score: {fb.originalRiskScore}/100</span>
                  <span>{fb.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hyperparameter Fine-Tuning */}
        <form onSubmit={handleSaveHyperparameters} className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Hyperparameter Tuning (Model Optimization)
              </h4>
            </div>
            <button
              type="submit"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline"
            >
              Apply Hyperparameters
            </button>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-semibold">Learning Rate (Alpha)</span>
                <span className="font-mono text-teal-700 font-bold">{hyperparams.learningRate}</span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.1"
                step="0.005"
                value={hyperparams.learningRate}
                onChange={e => setHyperparams({ ...hyperparams, learningRate: Number(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-semibold">Decision Estimators (Trees)</span>
                <span className="font-mono text-teal-700 font-bold">{hyperparams.nEstimators}</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={hyperparams.nEstimators}
                onChange={e => setHyperparams({ ...hyperparams, nEstimators: Number(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-semibold">Max Tree Depth</span>
                <span className="font-mono text-teal-700 font-bold">{hyperparams.maxDepth}</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="1"
                value={hyperparams.maxDepth}
                onChange={e => setHyperparams({ ...hyperparams, maxDepth: Number(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-semibold">Anomaly Sensitivity Ratio</span>
                <span className="font-mono text-teal-700 font-bold">{hyperparams.anomalySensitivity}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.02"
                value={hyperparams.anomalySensitivity}
                onChange={e => setHyperparams({ ...hyperparams, anomalySensitivity: Number(e.target.value) })}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
          </div>
        </form>
      </div>

      {/* MODEL VERSION HISTORY & ROLLBACK */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Algorithm Model Registry & Version History
            </h4>
          </div>
          <span className="text-xs text-teal-700 font-mono bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 font-semibold">
            {models.length} Versions Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Model Name & Version</th>
                <th className="py-2.5 px-3">Algorithm Type</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">False Positives</th>
                <th className="py-2.5 px-3">Training Size</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {models.map(m => {
                const isActive = m.id === activeModel.id;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-teal-600 font-mono">{m.version}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{m.type}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-600">{m.accuracy}%</td>
                    <td className="py-3 px-3 font-mono text-teal-700 font-bold">{m.recall}%</td>
                    <td className="py-3 px-3 font-mono text-rose-600">{m.falsePositiveRate}%</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{m.trainingDatasetSize.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {isActive ? 'ACTIVE' : m.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => onUpdateActiveModel(m)}
                          className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          Switch / Rollback
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
