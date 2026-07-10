import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { User as UserIcon, Building, Phone, Mail, CheckCircle2, Edit2, Lock, X } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    college: '',
    contactNumber: ''
  });

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });

  // Organizer Reset Request Modal State
  const [showResetRequestModal, setShowResetRequestModal] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' });

  const fetchProfile = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem('userInfo'));
      if (!stored) {
        navigate('/login');
        return;
      }
      setUserInfo(stored);

      const response = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${stored.token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        if (data.participantProfile) {
          setEditForm({
            firstName: data.participantProfile.firstName || '',
            lastName: data.participantProfile.lastName || '',
            college: data.participantProfile.college || '',
            contactNumber: data.participantProfile.contactNumber || ''
          });
        } else if (data.organizerProfile) {
          setEditForm({
            organizerName: data.organizerProfile.organizerName || '',
            category: data.organizerProfile.category || '',
            description: data.organizerProfile.description || '',
            contactEmail: data.organizerProfile.contactEmail || '',
            contactNumber: data.organizerProfile.contactNumber || ''
          });
        }
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setIsEditing(false);
        fetchProfile(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMessage({ type: '', text: '' });
    
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      const res = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(pwdForm)
      });
      const data = await res.json();
      if (res.ok) {
        setPwdMessage({ type: 'success', text: 'Password updated successfully!' });
        setTimeout(() => setShowPasswordModal(false), 2000);
      } else {
        setPwdMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setPwdMessage({ type: 'error', text: 'Server error' });
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setResetMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/users/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, reason: resetReason })
      });
      const data = await res.json();
      if (res.ok) {
        setResetMessage({ type: 'success', text: 'Request submitted. The Admin will review it shortly.' });
        setResetReason('');
        setTimeout(() => setShowResetRequestModal(false), 2500);
      } else {
        setResetMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setResetMessage({ type: 'error', text: 'Server error' });
    }
  };

  if (loading) return <div className="min-h-screen"><Navbar /><div className="p-8 text-center">Loading profile...</div></div>;
  if (!profile) return null;

  const isParticipant = profile.role === 'Participant';
  const isOrganizer = profile.role === 'Organizer';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient">My Profile</h1>
          <div className="flex gap-3">
            {isParticipant && (
              <button 
                onClick={() => setShowPasswordModal(true)} 
                className="btn glass-panel text-sm py-2 flex items-center gap-2 hover:border-accent-neon hover:text-accent-neon transition-colors"
              >
                <Lock className="w-4 h-4" /> Change Password
              </button>
            )}
            {isOrganizer && (
              <button 
                onClick={() => setShowResetRequestModal(true)} 
                className="btn glass-panel text-sm py-2 flex items-center gap-2 hover:border-accent-neon hover:text-accent-neon transition-colors"
              >
                <Lock className="w-4 h-4" /> Request Password Reset
              </button>
            )}
            {(isParticipant || isOrganizer) && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn glass-panel text-sm py-2 flex items-center gap-2 hover:border-accent-secondary hover:text-accent-secondary transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Avatar & Basic */}
          <div className="glass-panel p-6 animate-fade-in text-center flex flex-col items-center">
            {/* DiceBear animated GIF avatar */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <img
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(profile.email)}&size=96`}
                alt="Profile avatar"
                style={{
                  width: '96px', height: '96px', borderRadius: '50%',
                  border: '2px solid var(--glass-border)',
                  boxShadow: '0 0 20px var(--accent-glow)',
                }}
              />
            </div>
            <h2 className="text-xl font-bold mb-1">
              {isParticipant ? `${profile.participantProfile?.firstName} ${profile.participantProfile?.lastName}` : profile.organizerProfile?.organizerName || 'Admin'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
              <Mail className="w-4 h-4" /> {profile.email}
            </p>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '0.3rem 1rem', borderRadius: '9999px',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)',
            }}>
              <CheckCircle2 className="w-4 h-4" />
              {profile.role}
            </div>
          </div>

          {/* Right Column: Details & Preferences */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Detailed Info */}
            {isParticipant && (
              <div className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Participant Details</h3>
                
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">First Name</label>
                        <input 
                          type="text" required
                          value={editForm.firstName}
                          onChange={e => setEditForm({...editForm, firstName: e.target.value})}
                          className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:border-accent-neon"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">Last Name</label>
                        <input 
                          type="text" required
                          value={editForm.lastName}
                          onChange={e => setEditForm({...editForm, lastName: e.target.value})}
                          className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:border-accent-neon"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">Participant Type (Non-Editable)</label>
                        <input 
                          type="text" disabled
                          value={profile.participantProfile?.participantType}
                          className="w-full bg-bg-secondary/50 border border-glass-border rounded-lg px-3 py-2 text-text-secondary cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">College</label>
                        <input 
                          type="text" required
                          disabled={profile.participantProfile?.participantType === 'IIIT'}
                          value={editForm.college}
                          onChange={e => setEditForm({...editForm, college: e.target.value})}
                          className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:border-accent-neon disabled:opacity-50"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-text-secondary mb-1">Contact Number</label>
                        <input 
                          type="tel" required
                          value={editForm.contactNumber}
                          onChange={e => setEditForm({...editForm, contactNumber: e.target.value})}
                          className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:border-accent-neon"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
                      <button type="submit" className="btn btn-primary text-sm py-2 px-6">Save Changes</button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Participant Type</label>
                      <div className="flex items-center gap-2 text-text-primary bg-bg-secondary p-3 rounded-lg border border-glass-border">
                        <UserIcon className="w-4 h-4 text-accent-secondary" />
                        {profile.participantProfile?.participantType}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">College</label>
                      <div className="flex items-center gap-2 text-text-primary bg-bg-secondary p-3 rounded-lg border border-glass-border">
                        <Building className="w-4 h-4 text-accent-secondary" />
                        {profile.participantProfile?.college}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-text-secondary mb-1">Contact Number</label>
                      <div className="flex items-center gap-2 text-text-primary bg-bg-secondary p-3 rounded-lg border border-glass-border">
                        <Phone className="w-4 h-4 text-accent-secondary" />
                        {profile.participantProfile?.contactNumber}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preferences */}
            {isParticipant && (
              <div className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-primary" style={{ color: 'var(--text-primary)' }}>Preferences & Interests</h3>
                  <button onClick={() => navigate('/onboarding')} className="text-accent-neon text-sm hover:underline">
                    Edit Interests
                  </button>
                </div>
                
                <div className="mb-6">
                  <label className="block text-xs text-text-secondary mb-2">Areas of Interest</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferences?.areasOfInterest?.length > 0 ? (
                      profile.preferences.areasOfInterest.map((interest, idx) => (
                        <span key={idx} className="px-3 py-1 bg-accent-primary/20 text-accent-neon rounded-full border border-accent-primary/30 text-sm">
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-text-secondary italic">No interests selected.</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-text-secondary mb-2">Followed Clubs</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferences?.followedOrganizers?.length > 0 ? (
                      profile.preferences.followedOrganizers.map(org => (
                        <span key={org._id} className="text-sm font-medium px-3 py-1 bg-glass-bg border border-glass-border rounded-full" style={{ color: 'var(--text-primary)' }}>
                          {org.organizerProfile?.organizerName}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-text-secondary italic">Not following anyone.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Organizer Detailed Info */}
            {isOrganizer && (
              <div className="glass-panel p-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Organizer Details</h3>
                
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">Club/Organizer Name</label>
                        <input 
                          type="text" required
                          value={editForm.organizerName}
                          onChange={e => setEditForm({...editForm, organizerName: e.target.value})}
                          className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:border-accent-neon"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">Category</label>
                        <input 
                          type="text" required
                          value={editForm.category}
                          onChange={e => setEditForm({...editForm, category: e.target.value})}
                          className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:border-accent-neon"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-text-secondary mb-1">Description</label>
                        <textarea 
                          rows="3"
                          value={editForm.description}
                          onChange={e => setEditForm({...editForm, description: e.target.value})}
                          className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:border-accent-neon"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">Contact Email (Public)</label>
                        <input 
                          type="email" required
                          value={editForm.contactEmail}
                          onChange={e => setEditForm({...editForm, contactEmail: e.target.value})}
                          className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:border-accent-neon"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-text-secondary mb-1">Contact Number (Public)</label>
                        <input 
                          type="tel" required
                          value={editForm.contactNumber}
                          onChange={e => setEditForm({...editForm, contactNumber: e.target.value})}
                          className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:border-accent-neon"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
                      <button type="submit" className="btn btn-primary text-sm py-2 px-6">Save Changes</button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-text-secondary mb-1">Description</label>
                      <div className="text-text-primary bg-bg-secondary p-3 rounded-lg border border-glass-border">
                        {profile.organizerProfile?.description || <span className="italic text-text-secondary">No description provided.</span>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Category</label>
                      <div className="flex items-center gap-2 text-text-primary bg-bg-secondary p-3 rounded-lg border border-glass-border">
                        <Building className="w-4 h-4 text-accent-secondary" />
                        {profile.organizerProfile?.category}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Contact Email</label>
                      <div className="flex items-center gap-2 text-text-primary bg-bg-secondary p-3 rounded-lg border border-glass-border">
                        <Mail className="w-4 h-4 text-accent-secondary" />
                        {profile.organizerProfile?.contactEmail || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Contact Number</label>
                      <div className="flex items-center gap-2 text-text-primary bg-bg-secondary p-3 rounded-lg border border-glass-border">
                        <Phone className="w-4 h-4 text-accent-secondary" />
                        {profile.organizerProfile?.contactNumber || 'N/A'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent-neon" /> Change Password
            </h3>
            
            {pwdMessage.text && (
              <div className={`p-3 rounded-lg text-sm mb-4 border ${pwdMessage.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                {pwdMessage.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Current Password</label>
                <input 
                  type="password" required
                  value={pwdForm.currentPassword}
                  onChange={e => setPwdForm({...pwdForm, currentPassword: e.target.value})}
                  className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:border-accent-neon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">New Password</label>
                <input 
                  type="password" required minLength={6}
                  value={pwdForm.newPassword}
                  onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})}
                  className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:border-accent-neon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Confirm New Password</label>
                <input 
                  type="password" required minLength={6}
                  value={pwdForm.confirmPassword}
                  onChange={e => setPwdForm({...pwdForm, confirmPassword: e.target.value})}
                  className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:border-accent-neon"
                />
              </div>
              <button type="submit" className="w-full btn btn-primary py-2 mt-2">Update Password</button>
            </form>
          </div>
        </div>
      )}\n\n      {/* Organizer Password Reset Request Modal */}
      {showResetRequestModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 w-full max-w-md relative animate-fade-in">
            <button onClick={() => { setShowResetRequestModal(false); setResetMessage({ type: '', text: '' }); setResetReason(''); }} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Lock className="w-5 h-5 text-accent-neon" /> Request Password Reset</h3>
            <p className="text-sm text-text-secondary mb-6">Your request will be reviewed by the Admin. You'll receive a temporary password once approved.</p>
            {resetMessage.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${resetMessage.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {resetMessage.text}
              </div>
            )}
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Reason for Reset</label>
                <textarea
                  required
                  rows={4}
                  value={resetReason}
                  onChange={e => setResetReason(e.target.value)}
                  placeholder="Briefly explain why you need a password reset..."
                  className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 focus:border-accent-neon focus:outline-none resize-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              <button type="submit" className="w-full btn btn-primary py-2">Submit Request</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
