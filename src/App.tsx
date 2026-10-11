import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LoginPortal } from './components/auth/LoginPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserDashboard } from './components/user/UserDashboard';
import {
  initialSystemConfig,
  initialTransactions,
  initialAlerts,
  initialAlgorithmModels,
  initialFeedbacks
} from './data/mockData';
import {
  SystemConfig,
  Transaction,
  FraudAlert,
  AlgorithmModel,
  ModelFeedback
} from './types/fraud';
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function App() {
  // Session State: null means user is on the Initial Login Portal Gateway
  const [currentUser, setCurrentUser] = useState<{
    role: 'ADMIN' | 'USER';
    name: string;
    accountNumber?: string;
  } | null>(null);

  const [systemConfig, setSystemConfig] = useState<SystemConfig>(initialSystemConfig);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [alerts, setAlerts] = useState<FraudAlert[]>(initialAlerts);
  const [models, setModels] = useState<AlgorithmModel[]>(initialAlgorithmModels);
  const [activeModel, setActiveModel] = useState<AlgorithmModel>(initialAlgorithmModels[0]);
  const [feedbacks, setFeedbacks] = useState<ModelFeedback[]>(initialFeedbacks);

  // Global Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleLogin = (role: 'ADMIN' | 'USER', name: string, accountNumber?: string) => {
    setCurrentUser({ role, name, accountNumber });
    showToast(`Authenticated successfully as ${name}`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Signed out. Returned to Access Verification Gateway.', 'info');
  };

  const handleSaveConfig = (updated: SystemConfig) => {
    setSystemConfig(updated);
    showToast(`System Configuration v${updated.version} deployed to active gateways.`, 'success');
  };

  const handleResetDefaults = () => {
    setSystemConfig(initialSystemConfig);
    showToast('Detection thresholds reset to recommended baseline parameters.', 'info');
  };

  const handleNewTransaction = (tx: Transaction, alert?: FraudAlert) => {
    setTransactions(prev => [tx, ...prev]);
    if (alert) {
      setAlerts(prev => [alert, ...prev]);
      showToast(`Suspicious activity flagged: ${alert.title}`, 'alert');
    } else {
      showToast(`Transaction ${tx.id} for $${tx.amount.toFixed(2)} approved safely.`, 'success');
    }
  };

  const handleResolveAlert = (alertId: string, action: 'VERIFIED' | 'DISPUTED' | 'BLOCKED', note?: string) => {
    setAlerts(prev =>
      prev.map(a => {
        if (a.id === alertId) {
          return {
            ...a,
            status: action === 'VERIFIED' ? 'REVIEWED' : 'BLOCKED',
            userResolution: {
              action,
              resolvedAt: new Date().toISOString(),
              note
            }
          };
        }
        return a;
      })
    );

    const targetAlert = alerts.find(a => a.id === alertId);
    if (targetAlert && (action === 'BLOCKED' || action === 'DISPUTED')) {
      setTransactions(prev =>
        prev.map(t => (t.id === targetAlert.transactionId ? { ...t, status: 'BLOCKED' } : t))
      );
    }

    showToast(
      action === 'VERIFIED'
        ? 'Alert verified as legitimate by cardholder.'
        : 'Payment disputed. Card credentials suspended.',
      action === 'VERIFIED' ? 'success' : 'alert'
    );
  };

  const handleAddFeedback = (newFb: Omit<ModelFeedback, 'id' | 'timestamp'>) => {
    const feedbackEntry: ModelFeedback = {
      ...newFb,
      id: `FB-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
    };
    setFeedbacks(prev => [feedbackEntry, ...prev]);
  };

  const handleUpdateTransactionStatus = (txId: string, status: Transaction['status']) => {
    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, status } : t))
    );
  };

  const handleUpdateActiveModel = (model: AlgorithmModel) => {
    setActiveModel(model);
    setModels(prev =>
      prev.map(m => (m.id === model.id ? { ...m, status: 'ACTIVE' } : { ...m, status: m.status === 'ACTIVE' ? 'BENCHMARK' : m.status }))
    );
    showToast(`Active inspection model switched to ${model.name}`, 'info');
  };

  const handleAddNewModel = (newModel: AlgorithmModel) => {
    setModels(prev => [newModel, ...prev]);
  };

  const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE').length;

  // When not logged in, render the LoginPortal
  if (!currentUser) {
    return <LoginPortal onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Navbar with Active User Info & Logout Button */}
      <Navbar
        currentRole={currentUser.role}
        userName={currentUser.name}
        onLogout={handleLogout}
        activeAlertsCount={activeAlertsCount}
        engineVersion={activeModel.version}
      />

      {/* Role Banner / Context Bar */}
      <div className="bg-white border-b border-slate-200/90 px-4 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">
              Active Environment:
            </span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
              currentUser.role === 'ADMIN'
                ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                : 'bg-teal-50 text-teal-800 border border-teal-200'
            }`}>
              {currentUser.role === 'ADMIN' ? 'ADMIN SECURITY CONSOLE' : 'CLIENT FINANCIAL PORTAL'}
            </span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span className="text-slate-500 hidden sm:inline">
              {currentUser.role === 'ADMIN'
                ? 'Configure thresholds, review detected anomalies, and retrain ML algorithms.'
                : 'Execute transactions and respond to security fraud alerts in real time.'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
            <span>ML Anomaly Sensitivity: {activeModel.hyperparameters.anomalySensitivity}</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Shield: Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {currentUser.role === 'ADMIN' ? (
          <AdminDashboard
            systemConfig={systemConfig}
            transactions={transactions}
            models={models}
            activeModel={activeModel}
            feedbacks={feedbacks}
            onSaveConfig={handleSaveConfig}
            onResetDefaults={handleResetDefaults}
            onAddFeedback={handleAddFeedback}
            onUpdateTransactionStatus={handleUpdateTransactionStatus}
            onUpdateActiveModel={handleUpdateActiveModel}
            onAddNewModel={handleAddNewModel}
          />
        ) : (
          <UserDashboard
            userName={currentUser.name}
            accountNumber={currentUser.accountNumber}
            alerts={alerts}
            transactions={transactions}
            systemConfig={systemConfig}
            activeModel={activeModel}
            onNewTransaction={handleNewTransaction}
            onResolveAlert={handleResolveAlert}
          />
        )}
      </main>

      {/* Global Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom duration-300">
          <div className={`p-3.5 rounded-xl shadow-xl text-xs flex items-center gap-2.5 max-w-md border ${
            toastMessage.type === 'alert'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : toastMessage.type === 'info'
              ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {toastMessage.type === 'alert' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : toastMessage.type === 'info' ? (
              <Info className="w-4 h-4 text-cyan-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 text-xs py-4 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-700">AI Fraud Shield Engine</span>
            <span className="mx-2">·</span>
            <span>Real-Time Financial Anomaly Detection</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>Ensemble ML v2.4</span>
            <span className="text-slate-300">·</span>
            <span className="text-teal-700 font-medium">Aesthetic Light Theme</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
