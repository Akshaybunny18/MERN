import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import { Users, Building, ShieldCheck } from 'lucide-react';

const ClubsList = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    setUserInfo(user);

    const fetchOrganizers = async () => {
      try {
        const res = await fetch('/api/organizers');
        const data = await res.json();
        if (res.ok) setOrganizers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizers();
  }, []);

  const handleFollowToggle = async (e, organizerId) => {
    e.preventDefault(); // prevent navigation since it's a link overlay
    if (!userInfo) return;

    try {
      const res = await fetch(`/api/organizers/${organizerId}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        // Update local storage and state
        const updatedUser = {
          ...userInfo,
          preferences: {
            ...userInfo.preferences,
            followedOrganizers: data.followedOrganizers
          }
        };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        setUserInfo(updatedUser);
      }
    } catch (err) {
      console.error('Failed to toggle follow');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <header className="mb-12 animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-2">Clubs & Organizers</h1>
          <p className="text-text-secondary">Discover and follow approved organizers to stay updated.</p>
        </header>

        {loading ? (
          <div className="text-center text-text-secondary py-12">Loading organizers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizers.map((org, i) => {
              const isFollowing = userInfo?.preferences?.followedOrganizers?.includes(org._id);
              
              return (
                <Link 
                  to={`/organizers/${org._id}`} 
                  key={org._id} 
                  className="glass-panel p-6 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--glass-border)', flexShrink: 0 }}>
                      <img
                        src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(org.organizerProfile?.organizerName || org._id)}&size=48`}
                        alt={org.organizerProfile?.organizerName}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                    {userInfo?.role === 'Participant' && (
                      <button 
                        onClick={(e) => handleFollowToggle(e, org._id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                          isFollowing 
                            ? 'bg-transparent border-glass-border text-text-secondary hover:text-text-primary hover:border-text-primary' 
                            : 'bg-accent-primary border-accent-primary text-bg-primary hover:brightness-110 shadow-lg'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1 group-hover:text-accent-neon transition-colors">
                    {org.organizerProfile?.organizerName || 'Unnamed Organizer'}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-accent-secondary font-medium mb-4">
                    <ShieldCheck className="w-3 h-3" />
                    {org.organizerProfile?.category || 'General'}
                  </div>
                  
                  <p className="text-sm text-text-secondary line-clamp-3 mt-auto">
                    {org.organizerProfile?.description || 'No description provided.'}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClubsList;
