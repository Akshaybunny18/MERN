import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Lock, ChevronRight } from 'lucide-react';
import Navbar from '../Navbar';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-accent-neon" />
          <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
        </div>
        
        <p className="text-text-secondary mb-8">Manage the Infinium platform from here.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/admin/organizers" className="glass-panel p-6 flex flex-col items-center text-center hover:border-accent-primary transition-all group">
             <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
               <Users className="w-8 h-8" />
             </div>
             <h2 className="text-xl font-bold mb-2 group-hover:text-accent-primary transition-colors">Manage Organizers</h2>
             <p className="text-text-secondary mb-4 flex-grow">Create new club accounts, disable access, or remove organizers permanently.</p>
             <div className="flex items-center text-accent-primary text-sm font-medium">
               Go to Manager <ChevronRight className="w-4 h-4" />
             </div>
          </Link>
          
          <Link to="/admin/reset-requests" className="glass-panel p-6 flex flex-col items-center text-center hover:border-accent-neon transition-all group">
             <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
               <Lock className="w-8 h-8" />
             </div>
             <h2 className="text-xl font-bold mb-2 group-hover:text-accent-neon transition-colors">Password Resets</h2>
             <p className="text-text-secondary mb-4 flex-grow">View and fulfill user password reset requests.</p>
             <div className="flex items-center text-accent-neon text-sm font-medium">
               View Requests <ChevronRight className="w-4 h-4" />
             </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
