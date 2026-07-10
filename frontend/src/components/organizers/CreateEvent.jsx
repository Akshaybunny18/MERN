import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import { Calendar, Tag, Info, FileText, CheckCircle, Plus, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventType: 'Normal',
    eligibility: '',
    registrationDeadline: '',
    startDate: '',
    endDate: '',
    registrationLimit: '',
    registrationFee: 0,
    tags: '',
    customFormStructure: [],
    merchDetails: {
      stockQuantity: '',
      purchaseLimit: '',
      variants: []
    }
  });

  // Custom Form Builder State
  const [newField, setNewField] = useState({ fieldName: '', fieldType: 'text', required: false, options: '' });

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const addCustomField = () => {
    if (!newField.fieldName) return;
    setFormData(prev => ({
      ...prev,
      customFormStructure: [...prev.customFormStructure, { 
        ...newField, 
        options: newField.options ? newField.options.split(',').map(o => o.trim()) : []
      }]
    }));
    setNewField({ fieldName: '', fieldType: 'text', required: false, options: '' });
  };

  const removeCustomField = (index) => {
    setFormData(prev => ({
      ...prev,
      customFormStructure: prev.customFormStructure.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (statusToSave) => {
    setLoading(true);
    setError('');
    
    try {
      const payload = { ...formData, tags: formData.tags.split(',').map(t => t.trim()), status: statusToSave };
      if (payload.eventType === 'Normal') delete payload.merchDetails;
      if (payload.eventType === 'Merchandise') delete payload.customFormStructure;

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        // If they chose Publish immediately, we actually have to hit the PUT endpoint since POST creates Drafts always based on backend logic.
        // Wait, the backend explicitly sets status: 'Draft' on POST.
        if (statusToSave === 'Published') {
           await fetch(`/api/events/${data._id}`, {
             method: 'PUT',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${userInfo.token}`
             },
             body: JSON.stringify({ status: 'Published' })
           });
        }
        navigate('/organizer/dashboard');
      } else {
        setError(data.message || 'Failed to save event');
      }
    } catch (err) {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pb-20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-gradient mb-8">Create New Event</h1>
        
        {/* Progress Bar */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-glass-border -z-10 transform -translate-y-1/2"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${step >= i ? 'bg-accent-primary text-bg-primary' : 'bg-bg-secondary border border-glass-border text-text-secondary'}`}>
              {i}
            </div>
          ))}
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-8">{error}</div>}

        <div className="glass-panel p-8">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Info className="text-accent-neon"/> Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Event Name</label>
                  <input type="text" className="w-full p-3 bg-bg-primary border border-glass-border rounded-lg text-text-primary" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Event Type</label>
                  <select className="w-full p-3 bg-bg-primary border border-glass-border rounded-lg text-text-primary" value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})}>
                    <option value="Normal">Normal Event (Hackathon, Talk, etc)</option>
                    <option value="Merchandise">Merchandise Sale</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                <textarea rows="4" className="w-full p-3 bg-bg-primary border border-glass-border rounded-lg text-text-primary" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Start Date</label>
                  <DatePicker showTimeSelect dateFormat="Pp" className="w-full p-3 bg-bg-primary border border-glass-border rounded-lg text-text-primary" selected={formData.startDate ? new Date(formData.startDate) : null} onChange={date => setFormData({...formData, startDate: date.toISOString()})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">End Date</label>
                  <DatePicker showTimeSelect dateFormat="Pp" className="w-full p-3 bg-bg-primary border border-glass-border rounded-lg text-text-primary" selected={formData.endDate ? new Date(formData.endDate) : null} onChange={date => setFormData({...formData, endDate: date.toISOString()})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Reg. Deadline</label>
                  <DatePicker showTimeSelect dateFormat="Pp" className="w-full p-3 bg-bg-primary border border-glass-border rounded-lg text-text-primary" selected={formData.registrationDeadline ? new Date(formData.registrationDeadline) : null} onChange={date => setFormData({...formData, registrationDeadline: date.toISOString()})} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Details */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Tag className="text-accent-primary"/> Pricing & Logistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Eligibility (Optional)</label>
                  <input type="text" placeholder="e.g., Only First Years" className="w-full p-3 bg-bg-primary border border-glass-border rounded-lg text-text-primary" value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Tags (Comma separated)</label>
                  <input type="text" placeholder="Tech, Coding, Workshop" className="w-full p-3 bg-bg-primary border border-glass-border rounded-lg text-text-primary" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
                </div>
              </div>

              {formData.eventType === 'Normal' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-glass-border">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Registration Fee (₹)</label>
                    <input type="number" min="0" className="w-full p-3 bg-bg-primary border border-glass-border rounded-lg text-text-primary" value={formData.registrationFee} onChange={e => setFormData({...formData, registrationFee: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Max Participants (Leave blank for unlimited)</label>
                    <input type="number" min="1" className="w-full p-3 bg-bg-primary border border-glass-border rounded-lg text-text-primary" value={formData.registrationLimit} onChange={e => setFormData({...formData, registrationLimit: e.target.value})} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-glass-border">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Item Price (₹)</label>
                    <input type="number" min="0" className="w-full p-3 bg-bg-primary border border-glass-border rounded-lg text-text-primary" value={formData.registrationFee} onChange={e => setFormData({...formData, registrationFee: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Stock Quantity</label>
                    <input type="number" min="1" className="w-full p-3 bg-bg-primary border border-glass-border rounded-lg text-text-primary" value={formData.merchDetails.stockQuantity} onChange={e => setFormData({...formData, merchDetails: {...formData.merchDetails, stockQuantity: e.target.value}})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Max Per Person</label>
                    <input type="number" min="1" className="w-full p-3 bg-bg-primary border border-glass-border rounded-lg text-text-primary" value={formData.merchDetails.purchaseLimit} onChange={e => setFormData({...formData, merchDetails: {...formData.merchDetails, purchaseLimit: e.target.value}})} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Form Builder (Only for Normal) */}
          {step === 3 && formData.eventType === 'Normal' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><FileText className="text-purple-400"/> Custom Registration Form</h2>
              <p className="text-text-secondary mb-4">Add custom fields that participants must fill out during registration.</p>
              
              {/* Field Builder */}
              <div className="bg-bg-primary p-4 rounded-lg border border-glass-border mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-text-secondary mb-1">Field Question/Label</label>
                    <input type="text" placeholder="e.g., T-Shirt Size" className="w-full p-2 bg-bg-secondary border border-glass-border rounded text-text-primary text-sm" value={newField.fieldName} onChange={e => setNewField({...newField, fieldName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Type</label>
                    <select className="w-full p-2 bg-bg-secondary border border-glass-border rounded text-text-primary text-sm" value={newField.fieldType} onChange={e => setNewField({...newField, fieldType: e.target.value})}>
                      <option value="text">Text Entry</option>
                      <option value="textarea">Long Paragraph</option>
                      <option value="select">Dropdown</option>
                      <option value="radio">Multiple Choice (Radio)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pb-2">
                    <input type="checkbox" id="req" checked={newField.required} onChange={e => setNewField({...newField, required: e.target.checked})} className="rounded bg-bg-secondary border-glass-border text-accent-primary focus:ring-accent-neon" />
                    <label htmlFor="req" className="text-sm">Required</label>
                  </div>
                </div>
                
                {/* Options input for select/radio */}
                {['select', 'radio'].includes(newField.fieldType) && (
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-text-secondary mb-1">Options (Comma separated)</label>
                    <input type="text" placeholder="Small, Medium, Large" className="w-full p-2 bg-bg-secondary border border-glass-border rounded text-text-primary text-sm" value={newField.options} onChange={e => setNewField({...newField, options: e.target.value})} />
                  </div>
                )}
                
                <button onClick={addCustomField} type="button" className="mt-4 text-sm bg-glass-panel border border-glass-border px-4 py-2 rounded text-text-primary hover:border-accent-neon transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4"/> Add Field
                </button>
              </div>

              {/* Added Fields Preview */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-text-secondary uppercase">Form Preview</h3>
                {formData.customFormStructure.length === 0 ? (
                   <p className="text-sm text-gray-500 italic">No custom fields added. Default name and email will still be collected.</p>
                ) : (
                  formData.customFormStructure.map((field, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-glass-border rounded-lg bg-bg-primary">
                      <div>
                        <span className="font-medium mr-2">{field.fieldName}</span>
                        <span className="text-xs text-text-secondary mr-2">({field.fieldType})</span>
                        {field.required && <span className="text-xs text-red-400 font-bold">*</span>}
                        {field.options && field.options.length > 0 && <p className="text-xs text-text-secondary mt-1">Options: {field.options.join(', ')}</p>}
                      </div>
                      <button onClick={() => removeCustomField(idx)} className="text-red-400 hover:text-red-300 p-2"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* STEP 3 (For Merch): Review */}
          {step === 3 && formData.eventType === 'Merchandise' && (
            <div className="text-center py-12">
               <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
               <h2 className="text-2xl font-bold mb-2">Ready to list merchandise!</h2>
               <p className="text-text-secondary">Please review your details before saving as a draft or publishing.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-glass-border">
            {step > 1 ? (
              <button onClick={handlePrev} className="btn bg-glass-panel border border-glass-border text-text-primary">Back</button>
            ) : <div></div>}
            
            <div className="flex gap-4">
              {step < 3 ? (
                <button onClick={handleNext} className="btn btn-primary">Continue</button>
              ) : (
                <>
                  <button disabled={loading} onClick={() => handleSave('Draft')} className="btn bg-glass-panel border border-glass-border text-text-primary">Save as Draft</button>
                  <button disabled={loading} onClick={() => handleSave('Published')} className="btn btn-primary bg-gradient-to-r from-accent-primary to-accent-neon shadow-lg shadow-accent-primary/20">Publish Event</button>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default CreateEvent;
