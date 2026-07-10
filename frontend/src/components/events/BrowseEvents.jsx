import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar';
import { Search, Filter, Flame, Calendar as CalendarIcon } from 'lucide-react';

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [eligibilityFilter, setEligibilityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [followedOnly, setFollowedOnly] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('userInfo'));
      
      // Fetch trending
      const trendRes = await fetch('/api/events?trending=true');
      const trendData = await trendRes.json();
      if (trendRes.ok) setTrending(trendData);

      // Fetch regular with filters
      let query = new URLSearchParams();
      if (search) query.append('search', search);
      if (typeFilter) query.append('type', typeFilter);
      if (eligibilityFilter) query.append('eligibility', eligibilityFilter);
      if (statusFilter) query.append('status', statusFilter);
      
      if (followedOnly && user?.preferences?.followedOrganizers) {
        query.append('followedOrganizers', user.preferences.followedOrganizers.join(','));
      }

      const eventRes = await fetch(`/api/events?${query.toString()}`);
      const eventData = await eventRes.json();
      if (eventRes.ok) setEvents(eventData);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, eligibilityFilter, statusFilter, followedOnly]);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userInfo?.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEvents(events.filter(ev => ev._id !== id));
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error deleting event');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {/* Trending Section */}
        {trending.length > 0 && !search && !typeFilter && !eligibilityFilter && !followedOnly && (
          <section className="mb-12 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-orange-400">
              <Flame className="w-6 h-6" /> Trending Events (Top 5)
            </h2>
            <div className="flex overflow-x-auto gap-6 pb-4 snap-x">
              {trending.map(event => (
                <Link to={`/events/${event._id}`} key={event._id} className="snap-start min-w-[300px] glass-panel p-6 hover:border-orange-500/50 transition-colors group">
                  <div className="inline-block px-2 py-1 rounded text-xs font-semibold bg-orange-500/20 text-orange-400 mb-3">
                    {event.eventType}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors line-clamp-1">{event.name}</h3>
                  <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" /> Filters
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Event Type</label>
                  <select 
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-neon"
                  >
                    <option value="">All Types</option>
                    <option value="Normal">Normal</option>
                    <option value="Merchandise">Merchandise</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Eligibility</label>
                  <select 
                    value={eligibilityFilter}
                    onChange={(e) => setEligibilityFilter(e.target.value)}
                    className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-neon"
                  >
                    <option value="">Anyone</option>
                    <option value="IIIT">IIIT Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent-neon"
                  >
                    <option value="">All Statuses</option>
                    <option value="Published">Upcoming (Published)</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={followedOnly}
                      onChange={(e) => setFollowedOnly(e.target.checked)}
                      className="rounded border-glass-border bg-bg-secondary text-accent-neon focus:ring-accent-neon"
                    />
                    <span className="text-sm">Followed Clubs Only</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-text-secondary" />
              </div>
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by name..."
                className="w-full glass-panel pl-12 pr-4 py-4 text-lg bg-bg-secondary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-neon transition-colors"
              />
            </div>

            {/* Results */}
            {loading ? (
              <div className="text-center py-12 text-text-secondary">Searching...</div>
            ) : events.length === 0 ? (
              <div className="glass-panel p-12 text-center text-text-secondary">
                No events found matching your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event, i) => (
                  <Link 
                    to={`/events/${event._id}`} 
                    key={event._id} 
                    className="glass-panel hover:-translate-y-1 transition-all duration-300 group animate-fade-in flex flex-col h-full overflow-hidden"
                    style={{ animationDelay: `${i * 0.05}s`, textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
                  >
                    {/* Event image */}
                    <div style={{ height: '140px', overflow: 'hidden', flexShrink: 0 }}>
                      <img
                        src={`/local_files/event_placeholder.jpg`}
                        alt={event.name}
                        onError={e => { e.target.src = `https://picsum.photos/seed/${event._id}/600/280`; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="inline-block px-2 py-1 rounded text-xs font-semibold bg-accent-primary/20 text-accent-neon">
                        {event.eventType}
                      </div>
                      <div className="text-xs font-medium text-text-secondary bg-glass-bg px-2 py-1 rounded">
                        {event.eligibility}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-accent-neon transition-colors line-clamp-1">{event.name}</h3>
                    <p className="text-sm text-accent-secondary font-medium mb-3">
                      By {event.organizerId?.organizerProfile?.organizerName}
                    </p>
                    <p className="text-sm text-text-secondary mb-6 line-clamp-2 flex-grow">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                      </div>
                      
                      {userInfo?.role === 'Admin' && (
                        <button 
                          onClick={(e) => handleDelete(e, event._id)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-xs transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrowseEvents;
