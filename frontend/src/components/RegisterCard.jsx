import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserPlus, Shield, User as UserIcon, Building, Phone } from 'lucide-react';

const RegisterCard = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [college, setCollege] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [participantType, setParticipantType] = useState('IIIT');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    // General email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // IIIT-specific frontend validation
    if (participantType === 'IIIT' && !(email.endsWith('@iiit.ac.in') || email.endsWith('@students.iiit.ac.in') || email.endsWith('@research.iiit.ac.in'))) {
      setError('IIIT Participants must use an @iiit.ac.in, @students.iiit.ac.in, or @research.iiit.ac.in email address.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          email, 
          password, 
          participantType,
          college: participantType === 'IIIT' ? 'IIIT' : college,
          contactNumber
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        // Route to onboarding instead of dashboard immediately
        navigate('/onboarding');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 py-12">
      <div className="glass-panel animate-fade-in max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-2">Create Account</h2>
          <p className="text-text-secondary">Join us as a participant</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Participant Type</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-text-secondary" />
                </div>
                <select 
                  value={participantType}
                  onChange={(e) => setParticipantType(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-glass-border rounded-lg bg-bg-secondary text-text-primary focus:outline-none focus:border-accent-neon transition-colors appearance-none"
                >
                  <option value="IIIT">IIIT Student</option>
                  <option value="Non-IIIT">Non-IIIT Participant</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">College / Org Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-text-secondary" />
                </div>
                <input 
                  type="text" 
                  required 
                  disabled={participantType === 'IIIT'}
                  value={participantType === 'IIIT' ? 'IIIT' : college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-glass-border rounded-lg bg-bg-secondary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-neon transition-colors disabled:opacity-50"
                  placeholder="Your College"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-text-secondary" />
                </div>
                <input 
                  type="text" 
                  required 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-glass-border rounded-lg bg-bg-secondary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-neon transition-colors"
                  placeholder="John"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-text-secondary" />
                </div>
                <input 
                  type="text" 
                  required 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-glass-border rounded-lg bg-bg-secondary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-neon transition-colors"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  className="block w-full pl-10 pr-3 py-3 border border-glass-border rounded-lg bg-bg-secondary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-neon transition-colors"
                  placeholder={participantType === 'IIIT' ? "you@iiit.ac.in" : "you@example.com"}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Contact Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-text-secondary" />
                </div>
                <input 
                  type="tel" 
                  required 
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-glass-border rounded-lg bg-bg-secondary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-neon transition-colors"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  className="block w-full pl-10 pr-3 py-3 border border-glass-border rounded-lg bg-bg-secondary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-neon transition-colors"
                  placeholder="••••••••"
                  minLength="6"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-secondary" />
                </div>
                <input 
                  type="password" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-glass-border rounded-lg bg-bg-secondary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-neon transition-colors"
                  placeholder="••••••••"
                  minLength="6"
                />
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn btn-primary flex justify-center items-center gap-2 mt-4"
          >
            {loading ? 'Creating Account...' : (
              <>
                Register
                <UserPlus className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-neon hover:text-accent-secondary transition-colors font-medium">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterCard;
