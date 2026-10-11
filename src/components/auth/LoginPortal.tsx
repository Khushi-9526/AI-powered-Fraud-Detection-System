import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Smartphone,
  RefreshCw,
  KeyRound,
  ArrowLeft,
  AlertCircle,
  Maximize2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface Props {
  onLogin: (role: 'ADMIN' | 'USER', name: string, accountNumber?: string) => void;
}

const KNOWN_USER_PROFILES = [
  { name: 'Alexander Wright', account: '4829-9021-3310', tier: 'Premier Checking', balance: '$24,850.00' },
  { name: 'Elena Rostova', account: '9012-4421-1189', tier: 'Private Wealth', balance: '$68,400.00' },
  { name: 'Marcus Sterling', account: '6773-8841-2094', tier: 'Commercial Business', balance: '$115,200.00' },
  { name: 'Sarah Jenkins', account: '1290-7714-5542', tier: 'Executive Checking', balance: '$42,100.00' }
];

export const LoginPortal: React.FC<Props> = ({ onLogin }) => {
  const [selectedPortal, setSelectedPortal] = useState<'ADMIN' | 'USER'>('USER');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Step state: 'CREDENTIALS' -> 'OTP'
  const [loginStep, setLoginStep] = useState<'CREDENTIALS' | 'OTP'>('CREDENTIALS');

  // User form state
  const [userNameInput, setUserNameInput] = useState('Alexander Wright');
  const [accountNumberInput, setAccountNumberInput] = useState('4829-9021-3310');
  const [userPassword, setUserPassword] = useState('password123');

  // Admin form state
  const [adminIdInput, setAdminIdInput] = useState('Sarah Vance (Chief Risk Officer)');
  const [adminPin, setAdminPin] = useState('admin987');

  // Google Authenticator / OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState<number>(30);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Rotating 30s OTP countdown timer simulation
  useEffect(() => {
    if (loginStep === 'OTP') {
      const interval = setInterval(() => {
        setOtpTimer(prev => (prev <= 1 ? 30 : prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loginStep]);

  // Auto-detect user details
  const matchedUser = KNOWN_USER_PROFILES.find(
    p => p.name.toLowerCase() === userNameInput.trim().toLowerCase() ||
         p.account.replace(/[-\s]/g, '') === accountNumberInput.replace(/[-\s]/g, '')
  );

  const detectedUserName = userNameInput.trim() || 'Alexander Wright';
  const detectedAccountNumber = accountNumberInput.trim() || '4829-9021-3310';
  const detectedUserTier = matchedUser ? matchedUser.tier : 'Verified Client Account';

  const handleUserSelectPreset = (profile: typeof KNOWN_USER_PROFILES[0]) => {
    setUserNameInput(profile.name);
    setAccountNumberInput(profile.account);
  };

  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setOtpDigits(['', '', '', '', '', '']);
    setLoginStep('OTP');
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setOtpError(null);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleQuickFillOtp = () => {
    const demoCode = '492817';
    setOtpDigits(demoCode.split(''));
    setOtpError(null);
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredCode = otpDigits.join('');

    if (enteredCode.length < 6) {
      setOtpError('Please enter all 6 digits from Google Authenticator.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (selectedPortal === 'USER') {
        onLogin('USER', detectedUserName, detectedAccountNumber);
      } else {
        const adminName = adminIdInput.trim() || 'Sarah Vance (Chief Risk Officer)';
        onLogin('ADMIN', adminName);
      }
    }, 600);
  };

  return (
    <div
      style={zoomLevel !== 1 ? ({ zoom: zoomLevel } as React.CSSProperties) : undefined}
      className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-teal-500 selection:text-white transition-all"
    >
      {/* Sleek, Compact Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2 shadow-xs shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white shadow-xs flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                  AI-POWERED <span className="text-teal-600">FRAUD DETECTION SYSTEM</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1">
                  <span>☕</span>
                  <span>Java 21 / Spring Boot</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Enterprise Anomaly Detection & Financial Protection · Java Spring Boot Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Screenshot Fit Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  zoomLevel === 1 ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="100% Standard View"
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(0.9)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  zoomLevel === 0.9 ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="90% Screenshot Fit"
              >
                90% Fit
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(0.85)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  zoomLevel === 0.85 ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="85% Ultra Fit for Small Laptops"
              >
                85%
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Shield Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Sized to fit comfortably in standard viewports without cutoff */}
      <main className="max-w-3xl mx-auto w-full px-4 py-3 sm:py-5 flex-1 flex flex-col justify-center items-center">
        {loginStep === 'CREDENTIALS' ? (
          <div className="w-full flex flex-col items-center">
            {/* Header & Portal Switcher */}
            <div className="text-center max-w-lg mx-auto mb-3 space-y-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Access Verification Gateway
              </h1>
              <p className="text-xs text-slate-500">
                Select your portal to verify credentials. Google Authenticator 2-Step Verification requested next.
              </p>

              {/* Compact Portal Selector Tabs */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl mt-2 border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setSelectedPortal('USER')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    selectedPortal === 'USER'
                      ? 'bg-white text-teal-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>User Banking Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPortal('ADMIN')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    selectedPortal === 'ADMIN'
                      ? 'bg-white text-teal-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Security Portal</span>
                </button>
              </div>
            </div>

            {/* Conditionally Render ONLY the Selected Portal Card */}
            <div className="max-w-md w-full">
              {/* USER PORTAL */}
              {selectedPortal === 'USER' && (
                <div className="p-4 sm:p-5 rounded-2xl border border-teal-500/80 bg-white shadow-xl shadow-teal-500/5 ring-1 ring-teal-500/20 transition-all space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-100 text-teal-700">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">Client Financial Account</h3>
                        <p className="text-[11px] text-slate-500">
                          Sign in with account credentials. Profile auto-detected.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 shrink-0">
                      CLIENT PORTAL
                    </span>
                  </div>

                  {/* Registered Preset User Selectors */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                      Quick select account holder:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {KNOWN_USER_PROFILES.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleUserSelectPreset(p)}
                          className={`px-2 py-0.5 text-[11px] rounded-md transition-colors border ${
                            userNameInput === p.name
                              ? 'bg-teal-600 text-white font-bold border-teal-600 shadow-xs'
                              : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
                          }`}
                        >
                          {p.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleProceedToOtp} className="space-y-2 pt-0.5">
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-slate-700 block">Account Holder Full Name</label>
                      <input
                        type="text"
                        required
                        value={userNameInput}
                        onChange={e => setUserNameInput(e.target.value)}
                        placeholder="e.g. Alexander Wright"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-slate-700 block">Account Number / Online ID</label>
                      <input
                        type="text"
                        required
                        value={accountNumberInput}
                        onChange={e => setAccountNumberInput(e.target.value)}
                        placeholder="e.g. 4829-9021-3310"
                        className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500 transition-all"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-slate-700 block">Passcode / PIN</label>
                      <input
                        type="password"
                        required
                        value={userPassword}
                        onChange={e => setUserPassword(e.target.value)}
                        placeholder="Enter passcode"
                        className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500 transition-all"
                      />
                    </div>

                    {/* Auto-detected box */}
                    <div className="p-2 bg-teal-50/70 border border-teal-200 rounded-lg space-y-0.5 text-xs">
                      <div className="flex items-center justify-between text-teal-800 font-semibold text-[11px]">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          Auto-Detected Profile
                        </span>
                        <span className="text-[10px] text-teal-700 font-mono font-bold">{detectedUserTier}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex justify-between">
                        <span>Holder: <strong className="text-slate-900">{detectedUserName}</strong></span>
                        <span className="font-mono text-teal-700 font-medium">{detectedAccountNumber}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Continue with Google Authenticator</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedPortal('ADMIN')}
                        className="text-[11px] text-slate-500 hover:text-teal-700 hover:underline transition-colors"
                      >
                        Are you an administrator? Switch to <strong className="font-semibold text-slate-700">Admin Security Portal</strong> &rarr;
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ADMIN PORTAL */}
              {selectedPortal === 'ADMIN' && (
                <div className="p-4 sm:p-5 rounded-2xl border border-cyan-500/80 bg-white shadow-xl shadow-cyan-500/5 ring-1 ring-cyan-500/20 transition-all space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-700">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">Admin Security Console</h3>
                        <p className="text-[11px] text-slate-500">
                          Configure detection thresholds and retrain ML algorithms.
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 shrink-0">
                      SECURITY OPS
                    </span>
                  </div>

                  {/* Preset Clearance Roles */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                      Select clearance role:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        'Sarah Vance (Chief Risk Officer)',
                        'David Chen (Lead Anomaly Engineer)',
                        'Elena Morales (Fraud Operations Admin)'
                      ].map((adminName, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAdminIdInput(adminName)}
                          className={`px-2 py-0.5 text-[11px] rounded-md transition-colors border ${
                            adminIdInput === adminName
                              ? 'bg-cyan-600 text-white font-bold border-cyan-600 shadow-xs'
                              : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
                          }`}
                        >
                          {adminName.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleProceedToOtp} className="space-y-2 pt-0.5">
                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-slate-700 block">Security Admin ID / Officer Name</label>
                      <input
                        type="text"
                        required
                        value={adminIdInput}
                        onChange={e => setAdminIdInput(e.target.value)}
                        placeholder="e.g. Sarah Vance (Chief Risk Officer)"
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[11px] font-semibold text-slate-700 block">Clearance Key / PIN</label>
                      <input
                        type="password"
                        required
                        value={adminPin}
                        onChange={e => setAdminPin(e.target.value)}
                        placeholder="Enter clearance key"
                        className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    {/* Auto-detected Admin box */}
                    <div className="p-2 bg-cyan-50/70 border border-cyan-200 rounded-lg space-y-0.5 text-xs">
                      <div className="flex items-center justify-between text-cyan-800 font-semibold text-[11px]">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-cyan-600" />
                          Auto-Detected Clearance
                        </span>
                        <span className="text-[10px] text-cyan-700 font-mono font-bold">LEVEL 5 ROOT</span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex justify-between">
                        <span>Officer: <strong className="text-slate-900">{adminIdInput.split(' ')[0]}</strong></span>
                        <span className="text-emerald-700 font-medium">Clearance Verified</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Continue with Google Authenticator</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="pt-1 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedPortal('USER')}
                        className="text-[11px] text-slate-500 hover:text-cyan-700 hover:underline transition-colors"
                      >
                        Are you a banking client? Switch to <strong className="font-semibold text-slate-700">User Banking Portal</strong> &rarr;
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* STEP 2: GOOGLE AUTHENTICATOR / OTP SCREEN - Compact & Fits in Viewport */
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setLoginStep('CREDENTIALS')}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <div className="flex items-center gap-1 text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                <Smartphone className="w-3 h-3 text-teal-600" />
                <span>Google Authenticator</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Two-Factor Authentication</h2>
              <p className="text-xs text-slate-500">
                Enter the 6-digit verification code for{' '}
                <span className="text-slate-800 font-semibold">
                  {selectedPortal === 'USER' ? detectedUserName : adminIdInput.split(' ')[0]}
                </span>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              {/* 6 Digit OTP Inputs */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block text-center mb-2">
                  Google Authenticator 6-Digit Code
                </label>
                <div className="flex justify-center gap-1.5 sm:gap-2">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(index, e)}
                      className="w-9 h-11 sm:w-10 sm:h-12 text-center text-lg font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all shadow-xs"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-xs text-rose-600 text-center mt-1.5 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {otpError}
                  </p>
                )}
              </div>

              {/* Countdown timer & Demo code button */}
              <div className="flex items-center justify-between text-xs px-1 text-slate-500">
                <div className="flex items-center gap-1 text-[11px]">
                  <RefreshCw className="w-3 h-3 text-teal-600 animate-spin" />
                  <span>Rotates in: <strong className="font-mono text-slate-800">{otpTimer}s</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFillOtp}
                  className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold hover:underline"
                >
                  Sample OTP: 492817
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verify Code & Enter {selectedPortal === 'USER' ? 'Banking Portal' : 'Admin Console'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-1 text-center text-[10px] text-slate-400">
              <span>Backed by Time-based One-Time Password (TOTP RFC 6238)</span>
            </div>
          </div>
        )}
      </main>

      {/* Sleek Compact Footer */}
      <footer className="bg-white border-t border-slate-200/80 px-4 sm:px-6 py-2 text-[11px] text-slate-500 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">AI-powered Fraud Detection System</span>
            <span>·</span>
            <span className="text-amber-800 font-medium">☕ Java 21 / Spring Boot 3 Engine</span>
            <span>·</span>
            <span>2-Factor Authenticator</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
            <span>Google Authenticator TOTP</span>
            <span>·</span>
            <span className="text-teal-700 font-medium">Aesthetic Light Theme</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

