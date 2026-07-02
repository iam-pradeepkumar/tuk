import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, ChevronRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Hardcoded credentials for the admin portal
    // Username: admin
    // Password: TUK_Leaders_2026 (or similar)
    setTimeout(() => {
      if (username === 'admin' && password === 'tuk-admin-2026') {
        localStorage.setItem('tuk_admin_session', 'active');
        onLogin();
      } else {
        setError('Invalid credentials. Access denied.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#1E1250] flex items-center justify-center p-4 font-sans selection:bg-amber-400 selection:text-[#1E1250]">
      {/* Background purely decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-400/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[150px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl overflow-hidden">
          <div className="text-center mb-10">
            <div className="w-28 h-28 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl backdrop-blur-md border border-white/10 p-2">
              <img src="https://i.ibb.co/bYGc84w/image.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Admin Portal</h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">Restricted Access only for Authorized Personnel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-amber-400 uppercase tracking-widest pl-1">Username</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  autoFocus
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white/10 transition-all font-medium"
                  placeholder="Enter administrative ID"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-amber-400 uppercase tracking-widest pl-1">Secret Key</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white/10 transition-all font-medium"
                  placeholder="••••••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:hover:bg-amber-400 text-[#1E1250] font-black py-4 rounded-2xl transition-all shadow-[0_10px_25px_rgba(251,191,36,0.25)] flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#1E1250]/20 border-t-[#1E1250] rounded-full animate-spin"></div>
              ) : (
                <>
                  Verify Credentials <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] select-none">
            Tamilar Urimaigal Kalam • Secure Node
          </p>
        </div>
      </motion.div>
    </div>
  );
}
