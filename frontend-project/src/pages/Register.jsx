import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [msg, setMsg] = useState(''); 
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const submit = async e => {
    e.preventDefault();
    
    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setErr('Passwords do not match');
      setTimeout(() => setErr(''), 3000);
      return;
    }
    
    // Validate password strength
    if (form.password.length < 6) {
      setErr('Password must be at least 6 characters long');
      setTimeout(() => setErr(''), 3000);
      return;
    }
    
    setLoading(true);
    setErr('');
    try {
      await api.post('/auth/register', {
        username: form.username,
        password: form.password
      });
      setMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (e) { 
      setErr(e.response?.data?.message || 'Registration failed. Please try again.');
      setTimeout(() => setErr(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-slate-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return 'Not entered';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Register Card */}
      <div className="relative w-full max-w-md animate-slideUp">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
              <span className="text-5xl">🚀</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
            <p className="text-blue-100 text-sm">Join StockHub SMS today</p>
          </div>

          {/* Form Section */}
          <div className="p-6">
            {/* Success Message */}
            {msg && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2 animate-slideDown">
                <span className="text-green-500 text-lg">✓</span>
                <div className="flex-1">
                  <p className="text-sm text-green-700 font-medium">Success!</p>
                  <p className="text-xs text-green-600 mt-0.5">{msg}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {err && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 animate-shake">
                <span className="text-red-500 text-lg">⚠️</span>
                <div className="flex-1">
                  <p className="text-sm text-red-700 font-medium">Registration Failed</p>
                  <p className="text-xs text-red-600 mt-0.5">{err}</p>
                </div>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Username *
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
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Username must be unique and will be used to login
                </p>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password *
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
                    placeholder="Create a password"
                    value={form.password}
                    onChange={e => {
                      setForm({ ...form, password: e.target.value });
                      checkPasswordStrength(e.target.value);
                    }}
                    required
                  />
                </div>
                
                {/* Password Strength Indicator */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Use 6+ chars with letters, numbers & symbols
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">
                    ✓
                  </span>
                  <input
                    type="password"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                             transition-all duration-200 bg-slate-50 hover:bg-white"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span>⚠️</span> Passwords do not match
                  </p>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && form.password && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <span>✓</span> Passwords match
                  </p>
                )}
              </div>

              {/* Register Button */}
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Create Account</span>
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer Note */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">✓ Free account</span>
              <span className="flex items-center gap-1">✓ No credit card</span>
              <span className="flex items-center gap-1">✓ Full access</span>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center mt-4">
          <p className="text-xs text-white/60">
            StockHub SMS v1.0 - Complete Inventory Solution
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
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
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
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}