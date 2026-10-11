import React from 'react';
import {
  ShieldAlert,
  User,
  Shield,
  LogOut
} from 'lucide-react';

interface Props {
  currentRole: 'ADMIN' | 'USER';
  userName: string;
  onLogout: () => void;
  activeAlertsCount: number;
  engineVersion: string;
  zoomLevel?: number;
  onSetZoomLevel?: (level: number) => void;
}

export const Navbar: React.FC<Props> = ({
  currentRole,
  userName,
  onLogout,
  activeAlertsCount,
  engineVersion,
  zoomLevel = 1,
  onSetZoomLevel
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white shadow-xs flex items-center justify-center font-bold">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                AI-POWERED <span className="text-teal-600">FRAUD DETECTION SYSTEM</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1">
                <span>☕</span>
                <span>Java 21 / Spring Boot 3</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden md:block">
              Intelligent Financial Fraud Anomaly Prevention · Enterprise Spring Boot REST Engine
            </p>
          </div>
        </div>

        {/* User Session & Logout */}
        <div className="flex items-center gap-2.5">
          {/* Quick Screenshot Fit Controls */}
          {onSetZoomLevel && (
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs mr-1">
              <button
                type="button"
                onClick={() => onSetZoomLevel(1)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  zoomLevel === 1 ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="100% Standard View"
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => onSetZoomLevel(0.9)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  zoomLevel === 0.9 ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="90% Screenshot Fit"
              >
                90% Fit
              </button>
              <button
                type="button"
                onClick={() => onSetZoomLevel(0.85)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  zoomLevel === 0.85 ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="85% Ultra Fit"
              >
                85%
              </button>
            </div>
          )}

          {/* Active User Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            {currentRole === 'ADMIN' ? (
              <Shield className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            ) : (
              <User className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            )}
            <div className="leading-tight">
              <span className="font-semibold text-slate-900 block truncate max-w-[130px] sm:max-w-[180px]">
                {userName}
              </span>
              <span className="text-[10px] text-teal-600 font-mono uppercase tracking-wider block">
                {currentRole === 'ADMIN' ? 'Security Operations' : 'Active Account'}
              </span>
            </div>

            {currentRole === 'USER' && activeAlertsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                {activeAlertsCount}
              </span>
            )}
          </div>

          {/* Switch Portal / Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
            title="Log out and return to portal selection"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Switch Portal</span>
            <span className="sm:hidden">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
