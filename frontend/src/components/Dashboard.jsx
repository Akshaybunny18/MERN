import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { QrCode, Calendar as CalendarIcon, MapPin, X } from 'lucide-react';

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('Normal');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (!user) {
      navigate('/login');
    } else {
      setUserInfo(JSON.parse(user));
      fetchTickets(JSON.parse(user).token);
    }
  }, [navigate]);

  const fetchTickets = async (token) => {
    try {
      const res = await fetch('/api/tickets/my-tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!userInfo) return null;

  // Filter logic
  const now = new Date();
  
  const upcomingTickets = tickets.filter(t => 
    new Date(t.event?.startDate) > now && t.status === 'Registered'
  );

  const historyTickets = tickets.filter(t => {
    if (activeTab === 'Normal') return t.type === 'Normal' && t.status === 'Registered';
    if (activeTab === 'Merchandise') return t.type === 'Merchandise' && t.status === 'Registered';
    if (activeTab === 'Completed') return t.status === 'Completed';
    if (activeTab === 'Cancelled/Rejected') return ['Cancelled', 'Rejected'].includes(t.status);
    return false;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <header className="mb-12 animate-fade-in">
          <h1 className="text-3xl font-bold text-gradient mb-2">My Dashboard</h1>
          <p className="text-text-secondary">Manage your events, tickets, and merchandise.</p>
        </header>

        {/* Upcoming Events Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-accent-neon" />
            Upcoming Events
          </h2>
          
          {loading ? (
            <div className="text-text-secondary">Loading...</div>
          ) : upcomingTickets.length === 0 ? (
            <div className="glass-panel p-8 text-center text-text-secondary">
              No upcoming events found. Browse events to register!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTickets.map(ticket => (
                <div key={ticket._id} className="glass-panel p-6">
                  <div className="inline-block px-2 py-1 rounded text-xs font-semibold bg-accent-primary/20 text-accent-neon mb-3">
                    {ticket.type}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{ticket.event?.name}</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    By: {ticket.event?.organizerId?.organizerProfile?.organizerName}
                  </p>
                  <p className="text-sm mb-4">
                    {new Date(ticket.event?.startDate).toLocaleDateString()}
                  </p>
                  
                  <button 
                    onClick={() => setSelectedTicket(ticket)}
                    className="w-full btn btn-primary py-2 text-sm flex justify-center items-center gap-2"
                  >
                    <QrCode className="w-4 h-4" /> View Ticket
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Participation History */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Participation History</h2>
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-glass-border pb-2">
            {['Normal', 'Merchandise', 'Completed', 'Cancelled/Rejected'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-t-lg transition-colors font-medium text-sm ${
                  activeTab === tab 
                    ? 'bg-glass-bg border-b-2 border-accent-neon text-white' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-glass-border bg-white/5">
                    <th className="p-4 font-semibold text-text-secondary">Event Name</th>
                    <th className="p-4 font-semibold text-text-secondary">Type</th>
                    <th className="p-4 font-semibold text-text-secondary">Organizer</th>
                    <th className="p-4 font-semibold text-text-secondary">Status</th>
                    <th className="p-4 font-semibold text-text-secondary">Team Name</th>
                    <th className="p-4 font-semibold text-text-secondary">Ticket ID</th>
                  </tr>
                </thead>
                <tbody>
                  {historyTickets.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-text-secondary">
                        No records found for this category.
                      </td>
                    </tr>
                  ) : (
                    historyTickets.map(ticket => (
                      <tr key={ticket._id} className="border-b border-glass-border/50 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium">{ticket.event?.name}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 text-xs rounded bg-accent-primary/20 text-accent-neon">
                            {ticket.type}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-text-secondary">
                          {ticket.event?.organizerId?.organizerProfile?.organizerName}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            ticket.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                            ['Cancelled', 'Rejected'].includes(ticket.status) ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm">{ticket.teamName || '-'}</td>
                        <td className="p-4">
                          <button 
                            onClick={() => setSelectedTicket(ticket)}
                            className="text-accent-neon hover:underline text-sm font-mono flex items-center gap-1"
                          >
                            <QrCode className="w-3 h-3" /> {ticket.ticketId}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-sm overflow-hidden flex flex-col relative">
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <div className="bg-gradient-to-br from-accent-primary to-accent-secondary p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-1">{selectedTicket.event?.name}</h3>
              <p className="text-white/80 text-sm">{selectedTicket.type} Ticket</p>
            </div>
            
            <div className="p-6 bg-white flex flex-col items-center">
              {selectedTicket.qrCodeData ? (
                <img src={selectedTicket.qrCodeData} alt="QR Code" className="w-48 h-48 mb-4 border-4 border-white rounded-xl shadow-md" />
              ) : (
                <div className="w-48 h-48 mb-4 bg-gray-200 flex items-center justify-center rounded-xl text-gray-400">
                  No QR
                </div>
              )}
              <div className="font-mono text-gray-800 font-bold tracking-widest text-lg mb-1">
                {selectedTicket.ticketId}
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Valid Entry Pass</p>
            </div>
            
            <div className="p-4 bg-bg-secondary text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Participant:</span>
                <span className="font-medium">{userInfo.email}</span>
              </div>
              {selectedTicket.teamName && (
                <div className="flex justify-between mb-2">
                  <span className="text-text-secondary">Team:</span>
                  <span className="font-medium">{selectedTicket.teamName}</span>
                </div>
              )}
              {selectedTicket.purchaseDetails && selectedTicket.purchaseDetails.size && (
                <div className="flex justify-between mb-2">
                  <span className="text-text-secondary">Size:</span>
                  <span className="font-medium">{selectedTicket.purchaseDetails.size}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
