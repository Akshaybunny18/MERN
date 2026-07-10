import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../Navbar';
import { Building, ShieldCheck, Mail, Calendar as CalendarIcon } from 'lucide-react';

const ClubDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/organizers/${id}`);
        const result = await res.json();
        if (res.ok) {
          setData(result);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to fetch organizer details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="min-h-screen"><Navbar /><div className="p-8 text-center">Loading...</div></div>;
  if (error || !data) return <div className="min-h-screen"><Navbar /><div className="p-8 text-center text-red-400">{error}</div></div>;

  const { organizer, upcomingEvents, pastEvents } = data;

  const EventCard = ({ event }) => (
    <Link to={`/events/${event._id}`} className="glass-panel p-5 hover:border-accent-neon/50 transition-colors block">
      <div className="flex justify-between items-start mb-3">
        <span className="px-2 py-1 rounded text-xs font-semibold bg-accent-primary/20 text-accent-neon">
          {event.eventType}
        </span>
      </div>
      <h4 className="text-lg font-bold mb-2 line-clamp-1">{event.name}</h4>
      <p className="text-sm text-text-secondary mb-4 line-clamp-2">{event.description}</p>
      <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
        <CalendarIcon className="w-4 h-4" />
        {new Date(event.startDate).toLocaleDateString()}
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        {/* Organizer Header */}
        <div className="glass-panel p-8 mb-12 animate-fade-in flex flex-col md:flex-row gap-8 items-start">
          {/* Organizer logo */}
          <div style={{
            width: '96px', height: '96px', borderRadius: '1rem',
            overflow: 'hidden', border: '1px solid var(--glass-border)',
            flexShrink: 0, background: 'var(--bg-secondary)',
          }}>
            <img
              src={`/local_files/club_placeholder.jpg`}
              alt={organizer.organizerProfile?.organizerName}
              onError={e => { e.target.src = `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(organizer.organizerProfile?.organizerName || organizer._id)}&size=96`; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{organizer.organizerProfile?.organizerName}</h1>
              <ShieldCheck className="w-6 h-6 text-accent-neon" />
            </div>
            <div className="flex flex-wrap gap-4 mb-6">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-glass-border">
                {organizer.organizerProfile?.category}
              </span>
              <a href={`mailto:${organizer.email}`} className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-neon transition-colors">
                <Mail className="w-4 h-4" /> {organizer.email}
              </a>
            </div>
            <p className="text-text-secondary leading-relaxed max-w-3xl">
              {organizer.organizerProfile?.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Events Sections */}
        <div className="space-y-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              Upcoming Events <span className="text-sm font-normal text-text-secondary bg-white/5 px-2 py-1 rounded-full">{upcomingEvents.length}</span>
            </h2>
            {upcomingEvents.length === 0 ? (
              <div className="glass-panel p-8 text-center text-text-secondary">No upcoming events.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(event => <EventCard key={event._id} event={event} />)}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              Past Events <span className="text-sm font-normal text-text-secondary bg-white/5 px-2 py-1 rounded-full">{pastEvents.length}</span>
            </h2>
            {pastEvents.length === 0 ? (
              <div className="glass-panel p-8 text-center text-text-secondary">No past events.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map(event => <EventCard key={event._id} event={event} />)}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default ClubDetails;
