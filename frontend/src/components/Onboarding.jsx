import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, UserCircle } from 'lucide-react';

const INTERESTS = ['Technology', 'Cultural', 'Sports', 'Art', 'Music', 'Literature', 'Robotics', 'Coding', 'Debate'];

const Onboarding = () => {
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setLoading(true);
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ areasOfInterest: selectedInterests }),
      });
      
      if (response.ok) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 py-12">
      <div className="glass-panel animate-fade-in max-w-2xl w-full p-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent-primary/50 shadow-[0_0_15px_rgba(126,34,206,0.5)]">
            <UserCircle className="w-8 h-8 text-accent-neon" />
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-2">Welcome Aboard!</h2>
          <p className="text-text-secondary">Let's personalize your experience. What are you interested in?</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {INTERESTS.map(interest => (
            <button
              key={interest}
              onClick={() => toggleInterest(interest)}
              className={`px-4 py-2 rounded-full border transition-all duration-300 flex items-center gap-2 ${
                selectedInterests.includes(interest)
                  ? 'bg-accent-primary/30 border-accent-neon text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'bg-bg-secondary border-glass-border text-text-secondary hover:border-text-secondary'
              }`}
            >
              {interest}
              {selectedInterests.includes(interest) && <CheckCircle2 className="w-4 h-4 text-accent-neon" />}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button 
            onClick={handleSkip}
            className="btn bg-bg-secondary border border-glass-border text-text-secondary hover:text-white transition-colors"
          >
            Skip for now
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            {loading ? 'Saving...' : 'Save & Continue'}
            {!loading && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
