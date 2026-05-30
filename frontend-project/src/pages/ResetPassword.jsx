import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      // Fixed: Removed /api/ prefix
      await api.get(`/reset-password/${token}`);
      setValidToken(true);
    } catch (error) {
      setValidToken(false);
      setMsg({ 
        type: 'error', 
        text: error.response?.data?.message || 'Invalid or expired reset link' 
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setMsg({ type: 'error', text: 'Please fill in all fields' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      return;
    }
    
    if (password !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      return;
    }
    
    if (password.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      return;
    }
    
    setLoading(true);
    try {
      // Fixed: Removed /api/ prefix
      await api.post(`/reset-password/${token}`, { password, confirmPassword });
      setMsg({ type: 'success', text: 'Password reset successfully! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setMsg({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error resetting password' 
      });
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-white">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Invalid Reset Link</h2>
          <p className="text-slate-600 mb-6">{msg.text || 'This password reset link is invalid or has expired.'}</p>
          <Link to="/forgot-password" className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      {/* Animated Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Reset Password Card */}
      <div className="relative w-full max-w-md animate-slideUp">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
              <span className="text-5xl">🔑</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Reset Password</h2>
            <p className="text-blue-100 text-sm">Create a new password</p>
          </div>

          {/* Form Section */}
          <div className="p-6">
            {/* Message Toast */}
            {msg.text && (
              <div className={`mb-4 p-3 rounded-xl flex items-start gap-2 animate-shake
                            ${msg.type === 'success' 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-red-50 border border-red-200'}`}>
                <span className={msg.type === 'success' ? 'text-green-500' : 'text-red-500'}>
                  {msg.type === 'success' ? '✓' : '⚠'}
                </span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${msg.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {msg.type === 'success' ? 'Success!' : 'Error'}
                  </p>
                  <p className={`text-xs mt-0.5 ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {msg.text}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  New Password
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
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Minimum 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm New Password
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
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span>⚠️</span> Passwords do not match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && password && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <span>✓</span> Passwords match
                  </p>
                )}
              </div>

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
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    <span>Reset Password</span>
                  </>
                )}
              </button>

              <div className="text-center pt-4">
                <p className="text-sm text-slate-600">
                  Remember your password?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    Back to Login
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer Note */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <p className="text-center text-xs text-slate-500">
              🔐 Your password will be encrypted and stored securely
            </p>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center mt-4">
          <p className="text-xs text-white/60">
            StockHub SMS v1.0 - Secure Password Reset
          </p>
        </div>
      </div>

      <style>{`
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
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}