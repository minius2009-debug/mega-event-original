import React, { useState } from 'react';
import officialLogo from '../assets/images/logo2.png';
import { Shield, Lock, User, Eye, EyeOff, ArrowLeft, KeyRound, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface AdminLoginGateProps {
  onLoginSuccess: () => void;
  onBackHome: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({
  onLoginSuccess,
  onBackHome
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    setTimeout(() => {
      if (cleanUser === 'collabs' && cleanPass === 'collabs2026') {
        sessionStorage.setItem('collabs_admin_auth', 'true');
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('Authentication failed. Invalid administrator username or password.');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-emerald-600/10 blur-3xl pointer-events-none"></div>
      
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      ></div>

      {/* Top Bar with Return Link */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex items-center justify-between">
        <button
          onClick={onBackHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-3.5 py-2 rounded-xl transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft size={14} />
          <span>Return to Public Website</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Gateway Security Active</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="relative z-10 max-w-md w-full mx-auto px-4 py-8">
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500"></div>

          {/* Logo & Shield Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-lg mb-3">
              <img
                src={officialLogo}
                alt="Collabs Logo"
                className="w-12 h-12 object-contain rounded-xl"
              />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase tracking-widest mb-2">
              <Shield size={12} className="text-blue-400" />
              <span>Administrative Portal</span>
            </div>

            <h1 className="font-heading text-2xl font-black text-white tracking-tight">
              Collabs. Mission Control
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Please enter your admin credentials to access event operations, team records, and rosters.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter admin username"
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition-all outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 transition-all outline-none font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <KeyRound size={15} />
                  <span>Sign In to Mission Control</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security watermark footer */}
        <div className="text-center mt-6 text-slate-500 text-[11px]">
          <span>Protected by Collabs. Event Governance Protocol</span>
          <span className="mx-2">·</span>
          <span>Upper Chitral 2026</span>
        </div>
      </main>

      {/* Footer minimal info */}
      <footer className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 text-center text-xs text-slate-600">
        First Mega Event of Collabs · 31 October 2026 · Booni, Upper Chitral
      </footer>
    </div>
  );
};
