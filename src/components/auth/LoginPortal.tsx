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
  AlertCircle
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Aesthetic Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white shadow-sm flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  AI FRAUD <span className="text-teal-600">SHIELD</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
                  SECURE 2FA
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Enterprise Anomaly Detection & Financial Protection Platform
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Anomaly Shield Active</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-6 py-10 flex-1 flex flex-col justify-center">
        {loginStep === 'CREDENTIALS' ? (
          <div>
            <div className="text-center max-w-lg mx-auto mb-8 space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Access Verification Gateway
              </h1>
              <p className="text-sm text-slate-500">
                Select your portal to verify credentials. Google Authenticator 2-Step Verification will be requested next.
              </p>

              {/* Portal Selector Tabs */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl mt-4 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedPortal('USER')}
                  className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                    selectedPortal === 'USER'
                      ? 'bg-white text-teal-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>User Banking Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPortal('ADMIN')}
                  className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                    selectedPortal === 'ADMIN'
                      ? 'bg-white text-teal-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Security Portal</span>
                </button>
              </div>
            </div>

            {/* Portal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-4xl mx-auto w-full">
              {/* USER PORTAL */}
              <div
                className={`p-6 sm:p-7 rounded-2xl border transition-all flex flex-col justify-between ${
                  selectedPortal === 'USER'
                    ? 'bg-white border-teal-500/80 shadow-lg shadow-teal-500/5 ring-1 ring-teal-500/20'
                    : 'bg-white/70 border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 text-teal-700">
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                      CLIENT PORTAL
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Client Financial Account</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Sign in with your account credentials. Your profile is automatically detected.
                    </p>
                  </div>

                  {/* Registered Preset User Selectors */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1.5 font-semibold uppercase tracking-wider">
                      Quick select registered account holder:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {KNOWN_USER_PROFILES.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleUserSelectPreset(p)}
                          className={`px-2.5 py-1 text-xs rounded-lg transition-colors border ${
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

                  <form onSubmit={handleProceedToOtp} className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 block">Account Holder Full Name</label>
                      <input
                        type="text"
                        required
                        value={userNameInput}
                        onChange={e => setUserNameInput(e.target.value)}
                        placeholder="e.g. Alexander Wright"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 block">Account Number / Online ID</label>
                      <input
                        type="text"
                        required
                        value={accountNumberInput}
                        onChange={e => setAccountNumberInput(e.target.value)}
                        placeholder="e.g. 4829-9021-3310"
                        className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 block">Passcode / PIN</label>
                      <input
                        type="password"
                        required
                        value={userPassword}
                        onChange={e => setUserPassword(e.target.value)}
                        placeholder="Enter passcode"
                        className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-1 focus:ring-teal-500 transition-all"
                      />
                    </div>

                    {/* Auto-detected box */}
                    <div className="p-3 bg-teal-50/60 border border-teal-200/80 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between text-teal-800 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          Auto-Detected User Profile
                        </span>
                        <span className="text-[10px] text-teal-700 font-mono">{detectedUserTier}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex justify-between pt-0.5">
                        <span>Holder: <strong className="text-slate-900">{detectedUserName}</strong></span>
                        <span className="font-mono text-teal-700">{detectedAccountNumber}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Continue with Google Authenticator</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

              {/* ADMIN PORTAL */}
              <div
                className={`p-6 sm:p-7 rounded-2xl border transition-all flex flex-col justify-between ${
                  selectedPortal === 'ADMIN'
                    ? 'bg-white border-teal-500/80 shadow-lg shadow-teal-500/5 ring-1 ring-teal-500/20'
                    : 'bg-white/70 border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-700">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                      SECURITY OPERATIONS
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Admin Security Console</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure detection thresholds, inspect fraud graphical reports, and retrain ML algorithms.
                    </p>
                  </div>

                  {/* Preset Roles */}
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1.5 font-semibold uppercase tracking-wider">
                      Select clearance role:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Sarah Vance (Chief Risk Officer)',
                        'David Chen (Lead Anomaly Engineer)',
                        'Elena Morales (Fraud Operations Admin)'
                      ].map((adminName, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAdminIdInput(adminName)}
                          className={`px-2.5 py-1 text-xs rounded-lg transition-colors border ${
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

                  <form onSubmit={handleProceedToOtp} className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 block">Security Admin ID / Officer Name</label>
                      <input
                        type="text"
                        required
                        value={adminIdInput}
                        onChange={e => setAdminIdInput(e.target.value)}
                        placeholder="e.g. Sarah Vance (Chief Risk Officer)"
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 block">Clearance Key / PIN</label>
                      <input
                        type="password"
                        required
                        value={adminPin}
                        onChange={e => setAdminPin(e.target.value)}
                        placeholder="Enter clearance key"
                        className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    {/* Auto-detected Admin box */}
                    <div className="p-3 bg-cyan-50/60 border border-cyan-200/80 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between text-cyan-800 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                          Auto-Detected Clearance
                        </span>
                        <span className="text-[10px] text-cyan-700 font-mono">LEVEL 5 ROOT</span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex justify-between pt-0.5">
                        <span>Officer: <strong className="text-slate-900">{adminIdInput || 'Sarah Vance'}</strong></span>
                        <span className="text-emerald-700 font-medium">Clearance Verified</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Continue with Google Authenticator</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2: GOOGLE AUTHENTICATOR / OTP SCREEN */
          <div className="max-w-md mx-auto w-full bg-white rounded-2xl border border-slate-200 p-7 shadow-xl animate-in zoom-in-95 duration-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <button
                type="button"
                onClick={() => setLoginStep('CREDENTIALS')}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <div className="flex items-center gap-1 text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                <Smartphone className="w-3 h-3 text-teal-600" />
                <span>Google Authenticator</span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center mx-auto shadow-md">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Two-Factor Authentication</h2>
              <p className="text-xs text-slate-500">
                Enter the 6-digit verification code from your <strong>Google Authenticator</strong> app for{' '}
                <span className="text-slate-800 font-semibold">
                  {selectedPortal === 'USER' ? detectedUserName : adminIdInput}
                </span>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* 6 Digit OTP Inputs */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block text-center mb-3">
                  Google Authenticator 6-Digit Code
                </label>
                <div className="flex justify-center gap-2 sm:gap-2.5">
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
                      className="w-11 h-13 text-center text-xl font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all shadow-xs"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-xs text-rose-600 text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {otpError}
                  </p>
                )}
              </div>

              {/* Countdown timer & Demo code button */}
              <div className="flex items-center justify-between text-xs px-1 text-slate-500">
                <div className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                  <span>Code rotates in: <strong className="font-mono text-slate-800">{otpTimer}s</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFillOtp}
                  className="text-teal-600 hover:text-teal-700 font-semibold hover:underline"
                >
                  Fill Sample OTP (492817)
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Authenticator Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Code & Enter {selectedPortal === 'USER' ? 'Banking Portal' : 'Admin Console'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-400">
              <span>Backed by Time-based One-Time Password (TOTP RFC 6238)</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 px-6 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">AI Fraud Shield</span>
            <span>·</span>
            <span>2-Factor Authenticator Protected</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span>Google Authenticator TOTP</span>
            <span>·</span>
            <span className="text-teal-700 font-medium">Aesthetic Light Theme</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
