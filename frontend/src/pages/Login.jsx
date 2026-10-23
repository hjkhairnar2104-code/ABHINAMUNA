import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, LogIn, Sparkles, Shield, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleType) => {
    if (roleType === 'driver') {
      setEmail('user@smartev.com');
      setPassword('user123');
    } else {
      setEmail('admin@smartev.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-50 animate-in fade-in duration-500">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-500/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Smart<span className="text-teal-600">EV</span></h2>
          <p className="text-xs text-slate-500 mt-1">Autonomous EV Navigation & Battery Intelligence</p>
        </div>

        {/* Quick Demo Fill Pill Buttons */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
            Examiner / Quick Demo Accounts
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickFill('driver')}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-400 border border-slate-200 font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>EV Driver</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-400 border border-slate-200 font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-600" />
              <span>Admin SaaS</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@smartev.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white text-xs transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white text-xs transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Platform</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-600 font-bold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
