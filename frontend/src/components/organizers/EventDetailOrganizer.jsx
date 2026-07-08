import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Users, DollarSign, Calendar, Edit2, Lock, Save, ArrowLeft } from 'lucide-react';
import Navbar from '../Navbar';

const EventDetailOrganizer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/events/organizer/${id}/analytics`, {
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      const result = await response.json();
      if (response.ok) {
        setData(result);
        setEditForm({
          description: result.event.description,
          registrationDeadline: new Date(result.event.registrationDeadline).toISOString().slice(0, 16),
          registrationLimit: result.event.registrationLimit || '',
          status: result.event.status
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const payload = {};
      if (editForm.description !== data.event.description) payload.description = editForm.description;
      if (editForm.registrationLimit !== String(data.event.registrationLimit)) payload.registrationLimit = editForm.registrationLimit;
      if (editForm.status !== data.event.status) payload.status = editForm.status;
      
      const newDeadline = new Date(editForm.registrationDeadline);
      const oldDeadline = new Date(data.event.registrationDeadline);
      if (newDeadline.getTime() !== oldDeadline.getTime()) payload.registrationDeadline = newDeadline.toISOString();

      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsEditing(false);
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.message);
      }
    } catch (err) {
      alert('Error updating event');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userInfo.token}` }
      });
      const resData = await res.json();
      if (res.ok) {
        navigate('/organizer/dashboard');
      } else {
        alert(resData.message);
      }
    } catch (err) {
      alert('Error deleting event');
    }
  };

  const exportCSV = () => {
    if (!data || !data.participants.length) return alert('No participants to export');
    
    // Create headers dynamically based on custom form
    const customHeaders = data.event.customFormStructure?.map(f => f.fieldName) || [];
    
    let csvContent = "data:text/csv;charset=utf-8,";
    const baseHeaders = ["Ticket ID", "Name", "Email", "Status", "Team Name", "Date"];
    csvContent += [...baseHeaders, ...customHeaders].join(",") + "\n";
    
    data.participants.forEach(p => {
      const row = [
        p.ticketId,
        `"${p.name}"`,
        p.email,
        p.status,
        `"${p.teamName || ''}"`,
        new Date(p.createdAt).toLocaleDateString()
      ];
      
      // Add custom form responses in order
      customHeaders.forEach(header => {
         const resp = p.formResponses?.find(r => r.fieldName === header);
         row.push(`"${resp ? resp.response : ''}"`);
      });
      
      csvContent += row.join(",") + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `participants_${data.event.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="min-h-screen bg-bg-primary text-white flex justify-center items-center"><div className="w-8 h-8 border-4 border-accent-neon border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="min-h-screen bg-bg-primary text-white p-8"><div className="text-red-400 p-4 bg-red-500/10 rounded">{error}</div></div>;

  const { event, stats, participants } = data;

  return (
    <div className="min-h-screen bg-bg-primary text-white pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        
        <button onClick={() => navigate('/organizer/dashboard')} className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{event.name}</h1>
              <span className={`px-2 py-1 rounded text-xs font-bold ${event.status === 'Draft' ? 'bg-gray-500' : event.status === 'Published' ? 'bg-blue-500' : event.status === 'Ongoing' ? 'bg-green-500' : 'bg-red-500'}`}>
                {event.status}
              </span>
              {event.isFormLocked && <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Lock className="w-3 h-3"/> Form Locked</span>}
            </div>
            <p className="text-text-secondary">{event.eventType} Event • Created {new Date(event.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div className="flex gap-3">
             <button onClick={exportCSV} className="btn bg-glass-panel border border-glass-border text-white flex items-center gap-2 hover:border-accent-primary transition-colors">
               <Download className="w-4 h-4" /> Export CSV
             </button>
             {!isEditing ? (
               <>
                 <button onClick={() => setIsEditing(true)} className="btn btn-outline flex items-center gap-2">
                   <Edit2 className="w-4 h-4" /> Edit Event
                 </button>
                 {stats.totalRegistrations === 0 && (
                   <button onClick={handleDelete} className="btn bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 flex items-center gap-2 transition-colors">
                     Delete
                   </button>
                 )}
               </>
             ) : (
               <button onClick={handleUpdate} className="btn btn-primary flex items-center gap-2">
                 <Save className="w-4 h-4" /> Save Changes
               </button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {isEditing ? (
              <div className="glass-panel p-6 border-accent-primary shadow-lg shadow-accent-primary/10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Edit2 className="w-5 h-5 text-accent-primary"/> Editing Details</h3>
                <p className="text-xs text-text-secondary mb-4">Note: If event is Published, you can only extend deadlines and increase limits. If Ongoing/Completed, you can only change status.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1 text-text-secondary">Status</label>
                    <select className="w-full p-2 bg-bg-secondary border border-glass-border rounded" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-text-secondary">Description</label>
                    <textarea rows="3" className="w-full p-2 bg-bg-secondary border border-glass-border rounded" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1 text-text-secondary">Registration Deadline</label>
                      <input type="datetime-local" className="w-full p-2 bg-bg-secondary border border-glass-border rounded disabled:opacity-50" disabled={stats.totalRegistrations > 0} value={editForm.registrationDeadline} onChange={e => setEditForm({...editForm, registrationDeadline: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-text-secondary">Max Participants (Limit)</label>
                      <input type="number" className="w-full p-2 bg-bg-secondary border border-glass-border rounded disabled:opacity-50" disabled={stats.totalRegistrations > 0} value={editForm.registrationLimit} onChange={e => setEditForm({...editForm, registrationLimit: e.target.value})} />
                    </div>
                  </div>
                  {stats.totalRegistrations > 0 && (
                    <p className="text-xs text-orange-400 mt-2">Core details are locked because this event has registered participants.</p>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                   <button onClick={() => setIsEditing(false)} className="text-sm text-text-secondary hover:text-white">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold mb-4">Overview</h3>
                <p className="text-text-secondary mb-6 whitespace-pre-wrap">{event.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary block">Start Date</span>
                    <span className="font-medium">{new Date(event.startDate).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">End Date</span>
                    <span className="font-medium">{new Date(event.endDate).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Registration Deadline</span>
                    <span className="font-medium">{new Date(event.registrationDeadline).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Eligibility</span>
                    <span className="font-medium">{event.eligibility || 'Open to all'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Participants Table */}
            <div className="glass-panel overflow-hidden">
              <div className="p-6 border-b border-glass-border flex justify-between items-center bg-bg-secondary/50">
                <h3 className="text-lg font-bold flex items-center gap-2"><Users className="text-accent-neon w-5 h-5"/> Participants ({participants.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-bg-secondary text-text-secondary">
                    <tr>
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Ticket ID</th>
                      <th className="p-4 font-medium">Reg. Date</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-text-secondary">No participants registered yet.</td>
                      </tr>
                    ) : (
                      participants.map(p => (
                        <tr key={p.ticketId} className="border-t border-glass-border hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="font-medium text-white">{p.name}</div>
                            <div className="text-xs text-text-secondary">{p.email}</div>
                          </td>
                          <td className="p-4 font-mono text-xs">{p.ticketId}</td>
                          <td className="p-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Analytics Sidebar Column */}
          <div className="space-y-6">
            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><DollarSign className="text-green-400 w-5 h-5"/> Quick Analytics</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-secondary">Total Registrations</span>
                    <span className="font-bold">{stats.totalRegistrations} {event.registrationLimit ? `/ ${event.registrationLimit}` : ''}</span>
                  </div>
                  {event.registrationLimit && (
                    <div className="w-full bg-bg-secondary rounded-full h-2">
                      <div className="bg-accent-primary h-2 rounded-full" style={{ width: `${(stats.totalRegistrations / event.registrationLimit) * 100}%`}}></div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-bg-secondary rounded-lg border border-glass-border flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Estimated Revenue</span>
                  <span className="text-xl font-bold text-green-400">₹{stats.revenue}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default EventDetailOrganizer;
