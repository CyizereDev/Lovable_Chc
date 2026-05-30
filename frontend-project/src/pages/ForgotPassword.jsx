import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [resetLink, setResetLink] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMsg({ type: 'error', text: 'Please enter your email address' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      return;
    }
    
    setLoading(true);
    setResetLink('');
    try {
      const response = await api.post('/forgot-password', { email });
      setMsg({ 
        type: 'success', 
        text: response.data.message || 'If your email is registered, you will receive a password reset link' 
      });
      
      // For testing - show the reset link
      if (response.data.resetUrl) {
        setResetLink(response.data.resetUrl);
      }
      
      setEmail('');
    } catch (error) {
      console.error('Error:', error);
      setMsg({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error sending reset email' 
      });
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
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

      {/* Forgot Password Card */}
      <div className="relative w-full max-w-md animate-slideUp">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
              <span className="text-5xl">🔐</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Forgot Password?</h2>
            <p className="text-blue-100 text-sm">We'll help you reset it</p>
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
                    {msg.type === 'success' ? 'Email Sent!' : 'Error'}
                  </p>
                  <p className={`text-xs mt-0.5 ${msg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {msg.text}
                  </p>
                </div>
              </div>
            )}

            {/* Display Reset Link for Testing */}
            {resetLink && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-semibold text-blue-700 mb-2">Reset Link (Testing Only):</p>
                <a 
                  href={resetLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 break-all hover:underline"
                >
                  {resetLink}
                </a>
                <p className="text-xs text-blue-600 mt-2">
                  Click the link above to reset your password
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">
                    📧
                  </span>
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                             transition-all duration-200 bg-slate-50 hover:bg-white"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  We'll send a password reset link to this email
                </p>
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
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>📧</span>
                    <span>Send Reset Link</span>
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
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">✓ Secure reset process</span>
              <span className="flex items-center gap-1">✓ 1-hour link validity</span>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center mt-4">
          <p className="text-xs text-white/60">
            StockHub SMS v1.0 - Secure Password Recovery
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