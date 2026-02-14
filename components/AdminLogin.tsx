
import React, { useState } from 'react';
// Added ArrowLeft to imports to fix the undefined error
import { Crown, Lock, User, AlertCircle, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState('');

  const handleFirstStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'thalil007' && password === 'Tahlil007##') {
      setError('');
      setStep(2);
    } else {
      setError('Invalid master credentials. Access denied.');
    }
  };

  const handleFinalAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate a required fixed 2FA code for security feel
    if (twoFACode === '0070') {
      onLogin();
    } else {
      setError('Invalid secondary verification code.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 font-sans">
      <div className="w-full max-w-md animate-modalPop">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-[2.5rem] mb-8 relative">
            <Crown className="w-12 h-12 text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
            <div className="absolute -bottom-2 -right-2 bg-black border border-[#d4af37]/30 p-2 rounded-full">
              <ShieldCheck className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <h1 className="text-4xl font-serif italic gold-text mb-3 tracking-tight">Admin Terminal</h1>
          <p className="text-gray-600 uppercase tracking-[0.4em] text-[10px] font-black">Authorized Entry Only</p>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold p-4 rounded-2xl flex items-center space-x-3 uppercase tracking-widest animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleFirstStep} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Identity</label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" />
                    <input 
                      type="text" 
                      autoFocus
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black border border-white/5 rounded-2xl pl-14 pr-6 py-5 focus:border-[#d4af37] transition-all outline-none placeholder:text-gray-800" 
                      placeholder="Username" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-gray-500 font-black ml-1">Access Key</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#d4af37] transition-colors" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black border border-white/5 rounded-2xl pl-14 pr-6 py-5 focus:border-[#d4af37] transition-all outline-none placeholder:text-gray-800" 
                      placeholder="Password" 
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-6 bg-[#d4af37] text-black font-black uppercase tracking-[0.5em] text-xs rounded-2xl hover:bg-white hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center space-x-3"
              >
                <span>Initialize</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleFinalAuth} className="space-y-8 animate-fadeIn">
              <div className="text-center space-y-2 mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                   <ShieldCheck className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-bold">Two-Factor Verification</h3>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Master Key Required (Hint: 0070)</p>
              </div>

              <div className="space-y-3">
                <input 
                  type="text" 
                  autoFocus
                  maxLength={4}
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value)}
                  className="w-full bg-black border border-white/5 rounded-2xl px-6 py-6 text-center text-4xl font-black tracking-[1em] text-[#d4af37] focus:border-[#d4af37] transition-all outline-none" 
                  placeholder="----" 
                />
              </div>

              <div className="space-y-4">
                <button 
                  type="submit"
                  className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.5em] text-xs rounded-2xl hover:bg-[#d4af37] transition-all shadow-2xl"
                >
                  Verify Access
                </button>
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-[9px] uppercase tracking-widest text-gray-600 font-black hover:text-white transition-colors"
                >
                  Cancel & Restart
                </button>
              </div>
            </form>
          )}
        </div>

        <button 
          onClick={onBack}
          className="w-full mt-10 text-[9px] uppercase tracking-[0.4em] text-gray-700 font-black hover:text-[#d4af37] transition-all flex items-center justify-center space-x-3 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Exit Secure Gateway</span>
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
