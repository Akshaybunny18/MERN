import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';

const LoginCard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetReason, setResetReason] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        const dashMap = { Admin: '/admin/dashboard', Organizer: '/organizer/dashboard', Participant: '/dashboard' };
        navigate(dashMap[data.role] || '/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="glass-panel animate-fade-in max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-2">Welcome Back</h2>
          <p className="text-text-secondary">Sign in to continue</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-text-secondary" />
              </div>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-glass-border rounded-lg bg-bg-secondary text-white placeholder-text-secondary focus:outline-none focus:border-accent-neon transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-text-secondary" />
              </div>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-glass-border rounded-lg bg-bg-secondary text-white placeholder-text-secondary focus:outline-none focus:border-accent-neon transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex items-center justify-end">
            <button 
              type="button" 
              onClick={() => {
                if (!email) return alert('Please enter your email address first.');
                setShowResetModal(true);
              }}
              className="text-xs text-accent-neon hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn btn-primary flex justify-center items-center gap-2"
          >
            {loading ? 'Signing in...' : (
              <>
                Sign In
                <LogIn className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent-neon hover:text-accent-secondary transition-colors font-medium">
            Register here
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-sm p-6 relative">
            <h3 className="text-xl font-bold mb-4">Request Password Reset</h3>
            <p className="text-sm text-text-secondary mb-4">Only Organizers can request a password reset. Please provide a reason.</p>
            <textarea
              className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-white focus:border-accent-neon mb-4"
              rows="3"
              placeholder="Reason for reset..."
              value={resetReason}
              onChange={(e) => setResetReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-lg font-semibold text-text-secondary hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (!resetReason) return alert('Please provide a reason.');
                  try {
                    const res = await fetch('/api/users/request-reset', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email, reason: resetReason })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      alert('Password reset requested successfully.');
                      setShowResetModal(false);
                      setResetReason('');
                    } else {
                      alert(data.message);
                    }
                  } catch (e) {
                    alert('Error requesting reset');
                  }
                }}
                className="btn btn-primary"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginCard;
