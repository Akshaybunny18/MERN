import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import { Calendar as CalendarIcon, MapPin, Users, Package, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  
  // Registration Form State
  const [teamName, setTeamName] = useState('');
  const [formResponses, setFormResponses] = useState({});
  const [purchaseDetails, setPurchaseDetails] = useState({ size: '', quantity: 1 });
  
  const [registering, setRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (!user) {
      navigate('/login');
      return;
    }
    setUserInfo(JSON.parse(user));

    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (res.ok) {
          setEvent(data);
          // Initialize form responses map
          if (data.customFormStructure) {
            const initial = {};
            data.customFormStructure.forEach(field => {
              initial[field.fieldName] = '';
            });
            setFormResponses(initial);
          }
        } else {
          setError(data.message || 'Event not found');
        }
      } catch (err) {
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);
    setRegistrationError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/tickets/register/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({
          teamName: event.requiresTeam ? teamName : undefined,
          formResponses: event.eventType === 'Normal' ? formResponses : undefined,
          purchaseDetails: event.eventType === 'Merchandise' ? purchaseDetails : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Successfully ${event.eventType === 'Merchandise' ? 'purchased' : 'registered'}! Your ticket is in your Dashboard.`);
        // Note: We could redirect to dashboard, but let's show success message instead
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setRegistrationError(data.message);
      }
    } catch (err) {
      setRegistrationError('Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="min-h-screen"><Navbar /><div className="p-8 text-center">Loading...</div></div>;
  if (error || !event) return <div className="min-h-screen"><Navbar /><div className="p-8 text-center text-red-400">{error}</div></div>;

  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert('Event deleted successfully');
        navigate('/events');
      } else {
        alert(data.message || 'Failed to delete event');
      }
    } catch (err) {
      alert('Error deleting event');
    }
  };

  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isOutOfStock = event.eventType === 'Merchandise' && event.merchDetails?.stockQuantity <= 0;
  
  const canRegister = !isDeadlinePassed && !isOutOfStock;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden border border-glass-border">
              <img 
                src={`https://picsum.photos/seed/${event._id}/1200/600`} 
                alt={event.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="glass-panel p-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-primary/20 text-accent-neon border border-accent-primary/30">
                  {event.eventType} Event
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${event.status === 'Ongoing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : event.status === 'Closed' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                  {event.status}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-glass-bg border border-white/20">
                  Eligibility: {event.eligibility || 'Open to all'}
                </span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold">{event.name}</h1>
                {userInfo?.role === 'Admin' && (
                  <button 
                    onClick={handleDeleteEvent}
                    className="btn bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/40 text-sm py-1.5"
                  >
                    Delete Event
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-text-secondary mb-6">
                <ShieldCheck className="w-5 h-5 text-accent-secondary" />
                <span>Organized by <span className="text-text-primary font-medium">{event.organizerId?.organizerProfile?.organizerName}</span></span>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-text-secondary leading-relaxed">
                  {event.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-glass-border">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-accent-neon mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-text-primary">Date & Time</h4>
                    <p className="text-sm text-text-secondary">
                      Starts: {new Date(event.startDate).toLocaleString()}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Ends: {new Date(event.endDate).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent-neon mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-text-primary">Location</h4>
                    <p className="text-sm text-text-secondary">
                      {event.location || 'TBA'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-accent-neon mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-text-primary">Entry Details</h4>
                    <p className="text-sm text-text-secondary">
                      Fee: <span className="text-green-400 font-bold">{event.registrationFee > 0 ? `₹${event.registrationFee}` : 'Free'}</span>
                    </p>
                    {event.registrationLimit && (
                      <p className="text-sm text-text-secondary">
                        Limit: <span className="text-orange-400 font-bold">{event.registrationLimit} spots</span>
                      </p>
                    )}
                  </div>
                </div>
                
                {event.tags && event.tags.length > 0 && (
                  <div className="flex items-start gap-3 md:col-span-2 mt-2 pt-4 border-t border-glass-border/50">
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-text-secondary border border-white/10">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Registration / Purchase Form */}
          {userInfo?.role === 'Participant' && (
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-4 border-b border-glass-border pb-4">
                {event.eventType === 'Merchandise' ? 'Purchase Merch' : 'Register Now'}
              </h3>
              
              {isDeadlinePassed ? (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg flex gap-3 items-start mb-4">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">Registration deadline has passed ({new Date(event.registrationDeadline).toLocaleDateString()})</p>
                </div>
              ) : isOutOfStock ? (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg flex gap-3 items-start mb-4">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">This item is currently out of stock.</p>
                </div>
              ) : (
                <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 p-3 rounded-lg flex gap-2 items-center mb-6">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-xs">Closes on {new Date(event.registrationDeadline).toLocaleDateString()}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-lg flex gap-3 items-start mb-6">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{success}</p>
                </div>
              )}

              {registrationError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-6">
                  {registrationError}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                {event.eventType === 'Normal' && (
                  <>
                    {event.requiresTeam && (
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Team Name (Required)</label>
                        <input 
                          type="text" 
                          required 
                          disabled={!canRegister || registering}
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:border-accent-neon"
                        />
                      </div>
                    )}
                    
                    {event.customFormStructure && event.customFormStructure.map(field => (
                      <div key={field.fieldName}>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          {field.fieldName} {field.required && '*'}
                        </label>
                        {field.fieldType === 'text' || field.fieldType === 'textarea' || field.fieldType === 'number' ? (
                          <input 
                            type={field.fieldType === 'number' ? 'number' : 'text'}
                            required={field.required}
                            disabled={!canRegister || registering}
                            value={formResponses[field.fieldName] || ''}
                            onChange={(e) => setFormResponses({...formResponses, [field.fieldName]: e.target.value})}
                            className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-primary focus:border-accent-neon"
                            style={{ color: 'var(--text-primary)' }}
                          />
                        ) : (
                          <select
                            required={field.required}
                            disabled={!canRegister || registering}
                            value={formResponses[field.fieldName] || ''}
                            onChange={(e) => setFormResponses({...formResponses, [field.fieldName]: e.target.value})}
                            className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-primary focus:border-accent-neon"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            <option value="">Select option...</option>
                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {event.eventType === 'Merchandise' && (
                  <>
                    <div className="flex justify-between items-center mb-4 text-sm bg-glass-bg p-3 rounded-lg border border-glass-border">
                      <span className="text-text-secondary">Price:</span>
                      <span className="font-bold text-accent-neon">₹{event.merchDetails?.price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-sm bg-glass-bg p-3 rounded-lg border border-glass-border">
                      <span className="text-text-secondary">Stock left:</span>
                      <span className="font-bold">{event.merchDetails?.stockQuantity}</span>
                    </div>
                    
                    {event.merchDetails?.allowedSizes?.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Select Size</label>
                        <select
                          required
                          disabled={!canRegister || registering}
                          value={purchaseDetails.size}
                          onChange={(e) => setPurchaseDetails({...purchaseDetails, size: e.target.value})}
                          className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 focus:border-accent-neon"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <option value="">Choose a size...</option>
                          {event.merchDetails.allowedSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">Quantity (Max {event.merchDetails?.purchaseLimit})</label>
                      <input 
                        type="number" 
                        min="1"
                        max={event.merchDetails?.purchaseLimit}
                        required 
                        disabled={!canRegister || registering}
                        value={purchaseDetails.quantity}
                        onChange={(e) => setPurchaseDetails({...purchaseDetails, quantity: parseInt(e.target.value)})}
                        className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 focus:border-accent-neon"
                        style={{ color: 'var(--text-primary)' }}
                      />
                    </div>
                  </>
                )}
                
                <button 
                  type="submit" 
                  disabled={!canRegister || registering || success}
                  className={`w-full btn py-3 mt-4 ${!canRegister || success ? 'bg-gray-600 cursor-not-allowed text-gray-300' : 'btn-primary'}`}
                >
                  {registering ? 'Processing...' : event.eventType === 'Merchandise' ? 'Purchase Now' : 'Complete Registration'}
                </button>
              </form>
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventDetails;
