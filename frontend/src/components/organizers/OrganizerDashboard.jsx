import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Edit2, TrendingUp, Users, DollarSign } from 'lucide-react';
import Navbar from '../Navbar';

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events/organizer/my-events', {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          setError('Failed to fetch events');
        }
      } catch (err) {
        setError('Server error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [userInfo.token]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'Published': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Ongoing': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Closed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Organizer Dashboard</h1>
            <p className="text-text-secondary mt-1">Manage your events and view analytics.</p>
          </div>
          <Link to="/organizer/create-event" className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Event
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="text-accent-primary" /> My Events
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-accent-neon border-t-transparent rounded-full animate-spin"></div></div>
          ) : events.length === 0 ? (
            <div className="glass-panel p-8 text-center border-dashed border-2 border-glass-border">
              <Calendar className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Events Yet</h3>
              <p className="text-text-secondary mb-4">You haven't created any events. Start by creating a new event.</p>
              <Link to="/organizer/create-event" className="btn btn-outline inline-block">Create Your First Event</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <div key={event._id} className="glass-panel p-6 hover:border-accent-neon/50 transition-colors group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-accent-primary/20 text-accent-primary">
                      {event.eventType}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent-neon transition-colors line-clamp-1">{event.name}</h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2 flex-grow">{event.description}</p>
                  
                  <div className="pt-4 border-t border-glass-border">
                    <Link to={`/organizer/events/${event._id}`} className="text-accent-neon hover:text-accent-primary transition-colors text-sm font-medium flex items-center gap-1">
                      <Edit2 className="w-4 h-4" /> Manage Event
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Simple Analytics Overview */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="text-accent-secondary" /> Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="glass-panel p-6 flex items-center gap-4">
               <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                 <Calendar className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm text-text-secondary">Total Events</p>
                 <p className="text-2xl font-bold">{events.length}</p>
               </div>
             </div>
             <div className="glass-panel p-6 flex items-center gap-4">
               <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
                 <Users className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm text-text-secondary">Completed Events</p>
                 <p className="text-2xl font-bold">{events.filter(e => e.status === 'Completed').length}</p>
               </div>
             </div>
             <div className="glass-panel p-6 flex items-center gap-4">
               <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
                 <TrendingUp className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm text-text-secondary">Active Events</p>
                 <p className="text-2xl font-bold">{events.filter(e => e.status === 'Ongoing' || e.status === 'Published').length}</p>
               </div>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default OrganizerDashboard;
