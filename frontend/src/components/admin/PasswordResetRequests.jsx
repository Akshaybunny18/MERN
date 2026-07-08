import React, { useState, useEffect } from 'react';
import { Lock, Mail, CheckCircle, X, ShieldCheck } from 'lucide-react';
import Navbar from '../Navbar';

const PasswordResetRequests = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
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

  const handleResolve = async (status) => {
    try {
      const res = await fetch(`/api/users/admin/reset-requests/${selectedReq.userId}/${selectedReq.request._id}/resolve`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({ status, adminComment })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.newPassword) {
          setNewPassword(data.newPassword);
        } else {
          setSelectedReq(null);
          setAdminComment('');
        }
        fetchRequests();
      } else {
        alert(data.message);
      }
    } catch (e) {
      alert('Error resolving request');
    }
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
            <p className="text-text-secondary mb-4">There are currently no password reset requests.</p>
          </div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-secondary text-text-secondary border-b border-glass-border">
                  <tr>
                    <th className="p-4 font-medium">Club Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.request._id} className="border-b border-glass-border/50 hover:bg-white/5 transition-colors">
                      <td className="p-4">{req.organizerName || '-'}</td>
                      <td className="p-4">{req.email}</td>
                      <td className="p-4">{new Date(req.request.requestedAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded ${req.request.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : req.request.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {req.request.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {req.request.status === 'Pending' ? (
                          <button onClick={() => { setSelectedReq(req); setAdminComment(''); setNewPassword(''); }} className="btn btn-outline text-xs py-1 px-3">
                            Review
                          </button>
                        ) : (
                          <span className="text-xs text-text-secondary">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 relative">
            <button onClick={() => { setSelectedReq(null); setNewPassword(''); }} className="absolute top-4 right-4 text-text-secondary hover:text-white"><X className="w-5 h-5"/></button>
            <h3 className="text-xl font-bold mb-4">Review Reset Request</h3>
            
            {!newPassword ? (
              <>
                <div className="mb-4 text-sm">
                  <p><span className="text-text-secondary">Club:</span> {selectedReq.organizerName}</p>
                  <p><span className="text-text-secondary">Email:</span> {selectedReq.email}</p>
                  <div className="mt-2 p-3 bg-bg-secondary rounded-lg border border-glass-border">
                    <span className="text-text-secondary block mb-1">Reason provided:</span>
                    <p className="text-white">{selectedReq.request.reason}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm text-text-secondary mb-1">Admin Comment (Optional)</label>
                  <textarea 
                    className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-white focus:border-accent-neon"
                    rows="2"
                    value={adminComment}
                    onChange={e => setAdminComment(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button onClick={() => handleResolve('Rejected')} className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">Reject</button>
                  <button onClick={() => handleResolve('Approved')} className="flex-1 btn btn-primary">Approve & Generate</button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <ShieldCheck className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold mb-2">Password Reset Successful</h4>
                <p className="text-sm text-text-secondary mb-4">Please securely share this temporary password with the organizer. They must change it upon logging in.</p>
                <div className="bg-black/50 border border-green-500/30 p-4 rounded-lg font-mono text-xl tracking-widest text-green-400 mb-6">
                  {newPassword}
                </div>
                <button onClick={() => { setSelectedReq(null); setNewPassword(''); }} className="btn btn-outline w-full">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordResetRequests;
