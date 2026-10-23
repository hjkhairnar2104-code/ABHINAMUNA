import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Phone, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('ROLE_USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await register(name, email, password, phone, role);
      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      let msg = 'Registration failed. Please try again.';
      if (err.response?.data?.details) {
        msg = typeof err.response.data.details === 'string' 
          ? err.response.data.details 
          : Object.values(err.response.data.details).join('. ');
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (roleType) => {
    if (roleType === 'driver') {
      setName('Rohit Sharma');
      setEmail(`driver_${Date.now()}@smartev.com`);
      setPassword('user123');
      setPhone('9876543210');
      setRole('ROLE_USER');
    } else {
      setName('Operator Hub');
      setEmail(`admin_${Date.now()}@smartev.com`);
      setPassword('admin123');
      setPhone('9123456780');
      setRole('ROLE_ADMIN');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#f4f7fb] animate-in fade-in duration-500">
      
      {/* Background soft ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-2xl relative z-10 text-slate-800">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-[2px] mx-auto mb-3 shadow-lg shadow-teal-500/20">
            <div className="w-full h-full bg-[#00a896] rounded-[14px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Smart<span className="text-teal-600">EV</span> Account</h2>
          <p className="text-xs text-slate-600 mt-1 font-medium">Join the intelligent EV corridor network</p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 text-center">
            Instant Test / Demo Profiles
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('driver')}
              className="py-2 px-3 rounded-xl bg-white hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 border border-slate-200 font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Fill Driver Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-2 px-3 rounded-xl bg-white hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300 border border-slate-200 font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-600" />
              <span>Fill Admin Demo</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohit Sharma"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohit@example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Account Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('ROLE_USER')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  role === 'ROLE_USER'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                EV Driver / Fleet
              </button>
              <button
                type="button"
                onClick={() => setRole('ROLE_ADMIN')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  role === 'ROLE_ADMIN'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Station Operator
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-black text-sm hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-teal-500/20 disabled:opacity-40 flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-600 font-medium">
          Already registered?{' '}
          <Link to="/login" className="text-teal-700 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
