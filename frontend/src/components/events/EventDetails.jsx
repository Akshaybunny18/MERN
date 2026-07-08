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
          if (data.formStructure) {
            const initial = {};
            data.formStructure.forEach(field => {
              initial[field.label] = '';
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
            <div className="glass-panel p-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-primary/20 text-accent-neon border border-accent-primary/30">
                  {event.eventType} Event
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/20">
                  Eligibility: {event.eligibility}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
              
              <div className="flex items-center gap-2 text-text-secondary mb-6">
                <ShieldCheck className="w-5 h-5 text-accent-secondary" />
                <span>Organized by <span className="text-white font-medium">{event.organizerId?.organizerProfile?.organizerName}</span></span>
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
                    <h4 className="font-semibold text-white">Date & Time</h4>
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
                    <h4 className="font-semibold text-white">Location</h4>
                    <p className="text-sm text-text-secondary">
                      {event.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration / Purchase Form */}
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
                          className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-white focus:border-accent-neon"
                        />
                      </div>
                    )}
                    
                    {event.formStructure && event.formStructure.map(field => (
                      <div key={field.label}>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          {field.label} {field.isRequired && '*'}
                        </label>
                        {field.type === 'Text' || field.type === 'Number' ? (
                          <input 
                            type={field.type === 'Number' ? 'number' : 'text'}
                            required={field.isRequired}
                            disabled={!canRegister || registering}
                            value={formResponses[field.label] || ''}
                            onChange={(e) => setFormResponses({...formResponses, [field.label]: e.target.value})}
                            className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-white focus:border-accent-neon"
                          />
                        ) : (
                          <select
                            required={field.isRequired}
                            disabled={!canRegister || registering}
                            value={formResponses[field.label] || ''}
                            onChange={(e) => setFormResponses({...formResponses, [field.label]: e.target.value})}
                            className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-white focus:border-accent-neon"
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
                    <div className="flex justify-between items-center mb-4 text-sm bg-white/5 p-3 rounded-lg border border-glass-border">
                      <span className="text-text-secondary">Price:</span>
                      <span className="font-bold text-accent-neon">₹{event.merchDetails?.price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 text-sm bg-white/5 p-3 rounded-lg border border-glass-border">
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
                          className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-white focus:border-accent-neon"
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
                        className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-white focus:border-accent-neon"
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
        </div>
      </main>
    </div>
  );
};

export default EventDetails;
