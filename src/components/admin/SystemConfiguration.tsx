import React, { useState } from 'react';
import { SystemConfig } from '../../types/fraud';
import { Sliders, Save, RotateCcw, CheckCircle2, ShieldAlert, Cpu, AlertCircle } from 'lucide-react';

interface Props {
  config: SystemConfig;
  onSaveConfig: (updatedConfig: SystemConfig) => void;
  onResetDefaults: () => void;
}

export const SystemConfiguration: React.FC<Props> = ({
  config,
  onSaveConfig,
  onResetDefaults
}) => {
  const [formData, setFormData] = useState<SystemConfig>(config);
  const [showSuccessConfirmation, setShowSuccessConfirmation] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newCountry, setNewCountry] = useState('');

  const handleChange = (field: keyof SystemConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWeightChange = (key: keyof SystemConfig['featureWeights'], value: number) => {
    setFormData(prev => ({
      ...prev,
      featureWeights: {
        ...prev.featureWeights,
        [key]: value
      }
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !formData.highRiskCategories.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        highRiskCategories: [...prev.highRiskCategories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      highRiskCategories: prev.highRiskCategories.filter(c => c !== cat)
    }));
  };

  const handleAddCountry = () => {
    if (newCountry.trim() && !formData.restrictedCountries.includes(newCountry.trim())) {
      setFormData(prev => ({
        ...prev,
        restrictedCountries: [...prev.restrictedCountries, newCountry.trim()]
      }));
      setNewCountry('');
    }
  };

  const handleRemoveCountry = (country: string) => {
    setFormData(prev => ({
      ...prev,
      restrictedCountries: prev.restrictedCountries.filter(c => c !== country)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SystemConfig = {
      ...formData,
      version: formData.version + 1,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      updatedBy: 'Admin (Security Operations)'
    };
    onSaveConfig(updated);
    setShowSuccessConfirmation(true);
    setTimeout(() => {
      setShowSuccessConfirmation(false);
    }, 6000);
  };

  const totalWeights = Object.values(formData.featureWeights).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Confirmation Output of Successful Configuration Update */}
      {showSuccessConfirmation && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 flex items-start gap-3 shadow-sm animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-900">
              Confirmation: System Configuration Updated Successfully
            </h4>
            <p className="text-xs text-emerald-800">
              Detection thresholds and algorithm parameters have been synchronized across active gateway inspection nodes. System Configuration v{formData.version + 1} is now active.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-emerald-700">
              <span>Updated: {new Date().toLocaleTimeString()}</span>
              <span>·</span>
              <span>Auto-block ceiling: Score &ge; {formData.autoBlockAboveScore}</span>
              <span>·</span>
              <span>Max single limit: ${formData.maxSingleTransactionAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900">
              System Configuration Settings
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure real-time detection thresholds, ML algorithm sensitivity, risk parameters, and merchant blacklists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetDefaults}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            Save & Deploy Configuration
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: CORE DETECTION THRESHOLDS */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-teal-600" />
              <h4 className="text-sm font-bold text-slate-900">
                1. Risk Detection Thresholds
              </h4>
            </div>
            <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 font-semibold">
              v{formData.version} · Last updated {formData.lastUpdated}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Low Risk Boundary */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700">
                  Low Risk Cutoff (Safe &rarr; Review)
                </label>
                <span className="font-mono font-bold text-teal-700">
                  {formData.riskThresholdLow}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={formData.riskThresholdLow}
                onChange={e => handleChange('riskThresholdLow', Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Scores below this are instantly approved.</p>
            </div>

            {/* High Risk Boundary */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700">
                  High Risk Cutoff (Review &rarr; Flagged)
                </label>
                <span className="font-mono font-bold text-amber-600">
                  {formData.riskThresholdHigh}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="85"
                value={formData.riskThresholdHigh}
                onChange={e => handleChange('riskThresholdHigh', Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Scores above trigger fraud alerts to user & admin.</p>
            </div>

            {/* Auto Block Ceiling */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-700">
                  Immediate Auto-Lockdown Score
                </label>
                <span className="font-mono font-bold text-rose-600">
                  {formData.autoBlockAboveScore}
                </span>
              </div>
              <input
                type="range"
                min="75"
                max="95"
                value={formData.autoBlockAboveScore}
                onChange={e => handleChange('autoBlockAboveScore', Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Automatically blocks transaction and freezes card.</p>
            </div>

            {/* Max Single Amount */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Max Single Transaction Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  min="500"
                  max="100000"
                  step="250"
                  value={formData.maxSingleTransactionAmount}
                  onChange={e => handleChange('maxSingleTransactionAmount', Number(e.target.value))}
                  className="w-full pl-6 pr-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400">Absolute transaction ceiling before automatic block.</p>
            </div>

            {/* Velocity Burst Limit */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Velocity Burst Limit (Tx / 5 min)
              </label>
              <input
                type="number"
                min="2"
                max="20"
                value={formData.velocityLimitPer5Min}
                onChange={e => handleChange('velocityLimitPer5Min', Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-400">Max permissible requests before velocity alert triggers.</p>
            </div>

            {/* 2FA Step-up Threshold */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Step-up 2FA Challenge Floor ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  min="100"
                  max="20000"
                  step="100"
                  value={formData.require2FAAboveAmount}
                  onChange={e => handleChange('require2FAAboveAmount', Number(e.target.value))}
                  className="w-full pl-6 pr-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400">Forces OTP verification code sent to user phone/email.</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: ALGORITHM & FEATURE WEIGHT PARAMETERS */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-600" />
              <h4 className="text-sm font-bold text-slate-900">
                2. ML Algorithm Parameters & Feature Weighting
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Total Normalized Weight:</span>
              <span className={`font-mono font-bold ${totalWeights === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {totalWeights}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Active Detection Algorithm Pipeline
              </label>
              <select
                value={formData.aiModelType}
                onChange={e => handleChange('aiModelType', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white font-medium"
              >
                <option value="ENSEMBLE_HYBRID">Ensemble Hybrid (Isolation Forest + XGBoost)</option>
                <option value="ISOLATION_FOREST">Pure Isolation Forest Anomaly Filter</option>
                <option value="RANDOM_FOREST">Deep Neural Behavioral Classifier</option>
                <option value="RULE_ENGINE_ONLY">Deterministic Rule Guardrails Only</option>
              </select>
              <p className="text-[11px] text-slate-400">
                The hybrid model combines anomaly scoring with statistical behavioral profiles.
              </p>
            </div>

            {/* Sliders for Feature Weights */}
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              {(Object.keys(formData.featureWeights) as Array<keyof SystemConfig['featureWeights']>).map(key => (
                <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="capitalize font-semibold text-slate-700">
                      {key} Weight
                    </span>
                    <span className="font-mono text-teal-700 font-bold">
                      {formData.featureWeights[key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={formData.featureWeights[key]}
                    onChange={e => handleWeightChange(key, Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: HIGH RISK MERCHANT CATEGORIES & RESTRICTED COUNTRIES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Categories */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>High-Risk Merchant Categories</span>
              <span className="text-[10px] text-teal-700 font-mono">({formData.highRiskCategories.length} monitored)</span>
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add category (e.g. Gambling)"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold transition-colors"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {formData.highRiskCategories.map((cat, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-medium"
                >
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat)}
                    className="hover:text-rose-900 font-bold"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Restricted / Sanctioned Geographies</span>
              <span className="text-[10px] text-amber-700 font-mono">({formData.restrictedCountries.length} active)</span>
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add country / jurisdiction"
                value={newCountry}
                onChange={e => setNewCountry(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCountry(); } }}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddCountry}
                className="px-3.5 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold transition-colors"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {formData.restrictedCountries.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-medium"
                >
                  <span>{c}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCountry(c)}
                    className="hover:text-amber-900 font-bold"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <AlertCircle className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Parameters take effect immediately across all client payment sessions without service interruption.</span>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save & Deploy Configuration Update
          </button>
        </div>
      </form>
    </div>
  );
};
