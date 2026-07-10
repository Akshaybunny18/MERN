import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Users, DollarSign, Edit2, Lock, Save, ArrowLeft, Plus, Trash2, FileText } from 'lucide-react';
import Navbar from '../Navbar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FIELD_TYPES = ['text', 'number', 'textarea', 'select'];

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
  // Form builder state (only editable when 0 registrations)
  const [editFormStructure, setEditFormStructure] = useState([]);

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
        setEditFormStructure(result.event.customFormStructure || []);
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

      // Include form structure only if no registrations yet
      if (stats.totalRegistrations === 0) {
        payload.customFormStructure = editFormStructure;
      }

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

  // --- Form Builder Helpers ---
  const addField = () => {
    setEditFormStructure(prev => [...prev, { fieldName: '', fieldType: 'text', required: false, options: [] }]);
  };
  const removeField = (idx) => {
    setEditFormStructure(prev => prev.filter((_, i) => i !== idx));
  };
  const updateField = (idx, key, value) => {
    setEditFormStructure(prev => prev.map((f, i) => i === idx ? { ...f, [key]: value } : f));
  };
  const updateOptions = (idx, rawValue) => {
    updateField(idx, 'options', rawValue.split(',').map(s => s.trim()).filter(Boolean));
  };

  // --- CSV Export ---
  const exportCSV = () => {
    if (!data || !data.participants || data.participants.length === 0) {
      return alert('No participants to export');
    }
    
    const customHeaders = data.event.customFormStructure?.map(f => f.fieldName) || [];
    const baseHeaders = ['Ticket ID', 'Name', 'Email', 'Status', 'Team Name', 'Registered On'];
    const allHeaders = [...baseHeaders, ...customHeaders];

    const rows = data.participants.map(p => {
      const base = [
        p.ticketId,
        `"${p.name || ''}"`,
        p.email || '',
        p.status || '',
        `"${p.teamName || ''}"`,
        p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''
      ];
      // Match form responses to headers in order
      const formCols = customHeaders.map(header => {
        if (Array.isArray(p.formResponses)) {
          const found = p.formResponses.find(r => r.fieldName === header);
          return `"${found ? found.response : ''}"`;
        }
        // formResponses might be an object map
        if (p.formResponses && typeof p.formResponses === 'object') {
          return `"${p.formResponses[header] || ''}"`;
        }
        return '""';
      });
      return [...base, ...formCols].join(',');
    });

    const csvContent = [allHeaders.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `participants_${data.event.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="min-h-screen bg-bg-primary flex justify-center items-center"><div className="w-8 h-8 border-4 border-accent-neon border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="min-h-screen bg-bg-primary p-8"><div className="text-red-400 p-4 bg-red-500/10 rounded">{error}</div></div>;

  const { event, stats, participants } = data;
  const canEditForm = stats.totalRegistrations === 0;

  return (
    <div className="min-h-screen bg-bg-primary pb-20" style={{ color: 'var(--text-primary)' }}>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        
        <button onClick={() => navigate('/organizer/dashboard')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{event.name}</h1>
              <span className={`px-2 py-1 rounded text-xs font-bold ${event.status === 'Draft' ? 'bg-gray-500/30 text-gray-300' : event.status === 'Published' ? 'bg-blue-500/30 text-blue-300' : event.status === 'Ongoing' ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                {event.status}
              </span>
              {event.isFormLocked && <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><Lock className="w-3 h-3"/> Form Locked</span>}
            </div>
            <p className="text-text-secondary">{event.eventType} Event • Created {new Date(event.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div className="flex gap-3">
            <button onClick={exportCSV} className="btn glass-panel flex items-center gap-2 hover:border-accent-primary transition-colors text-sm">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)} className="btn btn-outline flex items-center gap-2 text-sm">
                  <Edit2 className="w-4 h-4" /> Edit Event
                </button>
                {stats.totalRegistrations === 0 && (
                  <button onClick={handleDelete} className="btn bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 flex items-center gap-2 transition-colors text-sm">
                    Delete
                  </button>
                )}
              </>
            ) : (
              <>
                <button onClick={() => { setIsEditing(false); fetchData(); }} className="btn glass-panel text-sm">Cancel</button>
                <button onClick={handleUpdate} className="btn btn-primary flex items-center gap-2 text-sm">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Event Details (view / edit) */}
            {isEditing ? (
              <div className="glass-panel p-6 border-accent-primary shadow-lg shadow-accent-primary/10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Edit2 className="w-5 h-5 text-accent-primary"/> Editing Details</h3>
                {stats.totalRegistrations > 0 && (
                  <p className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded px-3 py-2 mb-4">
                    ⚠️ Core details & form are locked because this event has {stats.totalRegistrations} registered participant(s). You can only update status.
                  </p>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1 text-text-secondary">Status</label>
                    <select
                      className="w-full p-2 bg-bg-secondary border border-glass-border rounded"
                      style={{ color: 'var(--text-primary)' }}
                      value={editForm.status}
                      onChange={e => setEditForm({...editForm, status: e.target.value})}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-text-secondary">Description</label>
                    <textarea
                      rows="3"
                      disabled={stats.totalRegistrations > 0}
                      className="w-full p-2 bg-bg-secondary border border-glass-border rounded disabled:opacity-50"
                      style={{ color: 'var(--text-primary)' }}
                      value={editForm.description}
                      onChange={e => setEditForm({...editForm, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1 text-text-secondary">Registration Deadline</label>
                      <DatePicker
                        showTimeSelect
                        dateFormat="Pp"
                        className="w-full p-2 bg-bg-secondary border border-glass-border rounded disabled:opacity-50"
                        disabled={stats.totalRegistrations > 0}
                        selected={editForm.registrationDeadline ? new Date(editForm.registrationDeadline) : null}
                        onChange={date => setEditForm({...editForm, registrationDeadline: date.toISOString().slice(0, 16)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1 text-text-secondary">Max Participants</label>
                      <input
                        type="number"
                        className="w-full p-2 bg-bg-secondary border border-glass-border rounded disabled:opacity-50"
                        style={{ color: 'var(--text-primary)' }}
                        disabled={stats.totalRegistrations > 0}
                        value={editForm.registrationLimit}
                        onChange={e => setEditForm({...editForm, registrationLimit: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Builder */}
                <div className="mt-6 border-t border-glass-border pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-accent-neon"/> Custom Registration Form</h4>
                    {!canEditForm && <span className="text-xs text-orange-400 flex items-center gap-1"><Lock className="w-3 h-3"/> Locked after first registration</span>}
                  </div>
                  {canEditForm ? (
                    <div className="space-y-3">
                      {editFormStructure.map((field, idx) => (
                        <div key={idx} className="p-4 bg-bg-secondary rounded-lg border border-glass-border space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Question / Field Name"
                              className="flex-1 p-2 text-sm bg-bg-primary border border-glass-border rounded"
                              style={{ color: 'var(--text-primary)' }}
                              value={field.fieldName}
                              onChange={e => updateField(idx, 'fieldName', e.target.value)}
                            />
                            <select
                              className="p-2 text-sm bg-bg-primary border border-glass-border rounded"
                              style={{ color: 'var(--text-primary)' }}
                              value={field.fieldType}
                              onChange={e => updateField(idx, 'fieldType', e.target.value)}
                            >
                              {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <button onClick={() => removeField(idx)} className="p-2 text-red-400 hover:text-red-300 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {field.fieldType === 'select' && (
                            <input
                              type="text"
                              placeholder="Options (comma separated, e.g. A, B, C)"
                              className="w-full p-2 text-sm bg-bg-primary border border-glass-border rounded"
                              style={{ color: 'var(--text-primary)' }}
                              value={field.options?.join(', ') || ''}
                              onChange={e => updateOptions(idx, e.target.value)}
                            />
                          )}
                          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={e => updateField(idx, 'required', e.target.checked)}
                              className="accent-accent-neon"
                            />
                            Required field
                          </label>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addField}
                        className="w-full btn glass-panel border-dashed text-sm flex items-center justify-center gap-2 hover:border-accent-neon hover:text-accent-neon transition-colors py-3"
                      >
                        <Plus className="w-4 h-4" /> Add Question
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-text-secondary italic">Form structure cannot be modified after registrations begin.</p>
                  )}
                </div>
              </div>
            ) : (
              <>
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

                {/* Form Structure View */}
                {event.customFormStructure && event.customFormStructure.length > 0 && (
                  <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-accent-neon" />
                      Registration Form Questions
                      {event.isFormLocked && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-normal flex items-center gap-1"><Lock className="w-3 h-3"/> Locked</span>}
                    </h3>
                    <div className="space-y-3">
                      {event.customFormStructure.map((field, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg border border-glass-border">
                          <div>
                            <p className="font-medium text-sm">{field.fieldName}</p>
                            <p className="text-xs text-text-secondary mt-0.5">
                              Type: <span className="text-accent-neon">{field.fieldType}</span>
                              {field.options?.length > 0 && ` • Options: ${field.options.join(', ')}`}
                            </p>
                          </div>
                          {field.required && (
                            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">Required</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {!canEditForm && (
                      <p className="text-xs text-text-secondary mt-3 italic">Form is locked because there are existing registrations.</p>
                    )}
                    {canEditForm && (
                      <p className="text-xs text-green-400 mt-3">✓ Form can still be edited (no registrations yet). Click "Edit Event" to modify.</p>
                    )}
                  </div>
                )}
                {(!event.customFormStructure || event.customFormStructure.length === 0) && (
                  <div className="glass-panel p-6 border-dashed">
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><FileText className="w-5 h-5 text-text-secondary"/>Registration Form</h3>
                    <p className="text-text-secondary text-sm">No custom form questions configured for this event.</p>
                    {canEditForm && <p className="text-xs text-accent-neon mt-2">Click "Edit Event" to add questions to the registration form.</p>}
                  </div>
                )}
              </>
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
                      {event.customFormStructure?.map(f => (
                        <th key={f.fieldName} className="p-4 font-medium">{f.fieldName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {participants.length === 0 ? (
                      <tr>
                        <td colSpan={4 + (event.customFormStructure?.length || 0)} className="p-8 text-center text-text-secondary">No participants registered yet.</td>
                      </tr>
                    ) : (
                      participants.map(p => (
                        <tr key={p.ticketId} className="border-t border-glass-border hover:bg-glass-bg transition-colors">
                          <td className="p-4">
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                            <div className="text-xs text-text-secondary">{p.email}</div>
                          </td>
                          <td className="p-4 font-mono text-xs">{p.ticketId}</td>
                          <td className="p-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">{p.status}</span>
                          </td>
                          {event.customFormStructure?.map(f => {
                            let val = '';
                            if (Array.isArray(p.formResponses)) {
                              const found = p.formResponses.find(r => r.fieldName === f.fieldName);
                              val = found ? found.response : '';
                            } else if (p.formResponses && typeof p.formResponses === 'object') {
                              val = p.formResponses[f.fieldName] || '';
                            }
                            return <td key={f.fieldName} className="p-4 text-text-secondary">{val}</td>;
                          })}
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
                      <div className="bg-accent-primary h-2 rounded-full" style={{ width: `${Math.min((stats.totalRegistrations / event.registrationLimit) * 100, 100)}%` }}></div>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-bg-secondary rounded-lg border border-glass-border flex justify-between items-center">
                  <span className="text-text-secondary text-sm">Estimated Revenue</span>
                  <span className="text-xl font-bold text-green-400">₹{stats.revenue}</span>
                </div>
                {!canEditForm && (
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-xs text-orange-400 flex items-center gap-1"><Lock className="w-3 h-3"/> Form locked after first registration</p>
                  </div>
                )}
                {canEditForm && event.customFormStructure?.length > 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-xs text-green-400">✓ Form editable (no registrations yet)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetailOrganizer;
