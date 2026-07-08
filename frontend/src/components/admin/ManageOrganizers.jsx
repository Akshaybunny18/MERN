import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Ban, CheckCircle, Mail, Key } from 'lucide-react';
import Navbar from '../Navbar';

const ManageOrganizers = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add Organizer Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrg, setNewOrg] = useState({
    organizerName: '',
    category: '',
    email: '',
    description: '',
    contactEmail: '',
    contactNumber: ''
  });
  
  const [generatedCreds, setGeneratedCreds] = useState(null);

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const response = await fetch('/api/users/admin/organizers', {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      if (response.ok) {
        setOrganizers(await response.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    if (!window.confirm('Are you sure you want to change this account\'s status?')) return;
    try {
      const response = await fetch(`/api/users/admin/organizers/${id}/toggle-status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      if (response.ok) {
        fetchOrganizers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('WARNING: This will permanently delete the organizer. Continue?')) return;
    try {
      const response = await fetch(`/api/users/admin/organizers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      if (response.ok) {
        fetchOrganizers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddOrganizer = async (e) => {
    e.preventDefault();
    const generatedPassword = Math.random().toString(36).slice(-10); // simple auto password
    
    try {
      const response = await fetch('/api/users/admin/organizers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify({
          ...newOrg,
          password: generatedPassword
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setGeneratedCreds({ email: newOrg.email, password: generatedPassword });
        fetchOrganizers();
        setShowAddModal(false);
        setNewOrg({ organizerName: '', category: '', email: '', description: '', contactEmail: '', contactNumber: '' });
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error creating organizer');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-white pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Manage Organizers</h1>
            <p className="text-text-secondary mt-1">Total: {organizers.length} accounts</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Organizer
          </button>
        </div>

        {generatedCreds && (
          <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-lg mb-8 relative">
            <h3 className="text-green-400 font-bold text-lg mb-2 flex items-center gap-2"><CheckCircle /> Account Created Successfully</h3>
            <p className="text-sm text-text-secondary mb-4">Please share these credentials securely with the organizer. They can log in immediately and change their password.</p>
            <div className="bg-bg-primary p-4 rounded border border-glass-border font-mono text-sm inline-block">
              <div className="flex items-center gap-2 mb-2"><Mail className="w-4 h-4 text-text-secondary"/> {generatedCreds.email}</div>
              <div className="flex items-center gap-2"><Key className="w-4 h-4 text-text-secondary"/> {generatedCreds.password}</div>
            </div>
            <button onClick={() => setGeneratedCreds(null)} className="absolute top-4 right-4 text-text-secondary hover:text-white">✕</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-accent-neon border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-secondary text-text-secondary border-b border-glass-border">
                  <tr>
                    <th className="p-4 font-medium">Name & Category</th>
                    <th className="p-4 font-medium">Login Email</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizers.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-text-secondary">No organizers found.</td></tr>
                  ) : (
                    organizers.map(org => (
                      <tr key={org._id} className={`border-b border-glass-border/50 hover:bg-white/5 transition-colors ${org.isDisabled ? 'opacity-50' : ''}`}>
                        <td className="p-4">
                          <div className="font-bold text-white">{org.organizerProfile?.organizerName || 'Unnamed'}</div>
                          <div className="text-xs text-text-secondary">{org.organizerProfile?.category}</div>
                        </td>
                        <td className="p-4">{org.email}</td>
                        <td className="p-4">
                          {org.isDisabled ? (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">Disabled</span>
                          ) : (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">Active</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleToggleStatus(org._id)} className="p-2 bg-bg-secondary rounded hover:bg-white/10 text-text-secondary hover:text-white transition-colors" title={org.isDisabled ? "Enable Account" : "Disable Account"}>
                              {org.isDisabled ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Ban className="w-4 h-4 text-orange-400" />}
                            </button>
                            <button onClick={() => handleDelete(org._id)} className="p-2 bg-bg-secondary rounded hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-colors" title="Delete Permanently">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-2xl p-6 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-text-secondary hover:text-white">✕</button>
            <h3 className="text-xl font-bold mb-6">Provision New Organizer</h3>
            
            <form onSubmit={handleAddOrganizer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Club/Organizer Name</label>
                  <input type="text" required value={newOrg.organizerName} onChange={e => setNewOrg({...newOrg, organizerName: e.target.value})} className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-white focus:border-accent-neon" />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1">Category</label>
                  <input type="text" required placeholder="e.g., Technical, Cultural" value={newOrg.category} onChange={e => setNewOrg({...newOrg, category: e.target.value})} className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-white focus:border-accent-neon" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-text-secondary mb-1">Login Email (Required for login)</label>
                  <input type="email" required placeholder="club@iiit.ac.in" value={newOrg.email} onChange={e => setNewOrg({...newOrg, email: e.target.value})} className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-white focus:border-accent-neon" />
                </div>
              </div>
              <button type="submit" className="w-full btn btn-primary py-3 mt-4">Create Account & Generate Password</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrganizers;
