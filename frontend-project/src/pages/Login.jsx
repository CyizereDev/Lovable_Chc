import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.username);
      navigate('/');
    } catch (e) { 
      setErr(e.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md animate-slideUp">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
              <span className="text-5xl">📦</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-blue-100 text-sm">Sign in to StockHub SMS</p>
          </div>

          {/* Form Section */}
          <div className="p-6">
            {/* Error Message */}
            {err && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 animate-shake">
                <span className="text-red-500 text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm text-red-700 font-medium">Login Failed</p>
                  <p className="text-xs text-red-600 mt-0.5">{err}</p>
                </div>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">
                    👤
                  </span>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                             transition-all duration-200 bg-slate-50 hover:bg-white"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">
                    🔒
                  </span>
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                             transition-all duration-200 bg-slate-50 hover:bg-white"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
  Forgot password?
</Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                         py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 
                         transition-all duration-200 shadow-md hover:shadow-lg 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Login</span>
                  </>
                )}
              </button>

              {/* Register Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-slate-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    Create an account
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer Note */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              Demo credentials: admin / admin123
            </p>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center mt-4">
          <p className="text-xs text-white/60">
            StockHub SMS v1.0 - Inventory Management System
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-2px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(2px);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}