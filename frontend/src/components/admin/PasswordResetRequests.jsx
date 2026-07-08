import React, { useState, useEffect } from 'react';
import { Lock, Mail, CheckCircle, Trash2 } from 'lucide-react';
import Navbar from '../Navbar';

const PasswordResetRequests = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/users/admin/reset-requests', {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      if (response.ok) {
        setRequests(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = (user) => {
    // In a real app, this might generate a token and email it, or let the admin type a new password.
    // For this basic UI, we just prompt the admin to manually copy a temporary password or contact them.
    alert(`Instructions: Contact ${user.email} and manually reset their password using the database if necessary, or build a deeper reset flow here.`);
  };

  return (
    <div className="min-h-screen bg-bg-primary text-white pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <Lock className="w-8 h-8 text-accent-neon" />
          <h1 className="text-3xl font-bold text-gradient">Password Reset Requests</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-accent-neon border-t-transparent rounded-full animate-spin"></div></div>
        ) : requests.length === 0 ? (
          <div className="glass-panel p-8 text-center border-dashed border-2 border-glass-border">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Requests</h3>
            <p className="text-text-secondary mb-4">There are currently no users requesting a password reset.</p>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-secondary text-text-secondary border-b border-glass-border">
                  <tr>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req._id} className="border-b border-glass-border/50 hover:bg-white/5 transition-colors">
                      <td className="p-4 flex items-center gap-2"><Mail className="w-4 h-4 text-text-secondary"/> {req.email}</td>
                      <td className="p-4">{req.role}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleFulfill(req)} className="btn btn-outline text-xs py-1 px-3">
                          Acknowledge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PasswordResetRequests;
