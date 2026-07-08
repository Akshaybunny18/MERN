import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  if (!userInfo) return null;

  const isActive = (path) => {
    return location.pathname.startsWith(path) 
      ? 'text-accent-neon border-b-2 border-accent-neon' 
      : 'text-text-secondary hover:text-white transition-colors';
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-x-0 border-b border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">Infinium</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-6">
                
                {/* PARTICIPANT LINKS */}
                {userInfo.role === 'Participant' && (
                  <>
                    <Link to="/dashboard" className={`px-3 py-5 text-sm font-medium flex items-center gap-2 ${isActive('/dashboard')}`}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/events" className={`px-3 py-5 text-sm font-medium flex items-center gap-2 ${isActive('/events')}`}>
                      <Calendar className="w-4 h-4" /> Browse Events
                    </Link>
                    <Link to="/organizers" className={`px-3 py-5 text-sm font-medium flex items-center gap-2 ${isActive('/organizers')}`}>
                      <Users className="w-4 h-4" /> Clubs/Organizers
                    </Link>
                  </>
                )}

                {/* ORGANIZER LINKS */}
                {userInfo.role === 'Organizer' && (
                  <>
                    <Link to="/organizer/dashboard" className={`px-3 py-5 text-sm font-medium flex items-center gap-2 ${isActive('/organizer/dashboard')}`}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/organizer/create-event" className={`px-3 py-5 text-sm font-medium flex items-center gap-2 ${isActive('/organizer/create-event')}`}>
                      <Calendar className="w-4 h-4" /> Create Event
                    </Link>
                    <Link to="/events" className={`px-3 py-5 text-sm font-medium flex items-center gap-2 ${isActive('/events')}`}>
                      <Calendar className="w-4 h-4" /> Ongoing Events
                    </Link>
                  </>
                )}

                {/* ADMIN LINKS */}
                {userInfo.role === 'Admin' && (
                  <>
                    <Link to="/admin/dashboard" className={`px-3 py-5 text-sm font-medium flex items-center gap-2 ${isActive('/admin/dashboard')}`}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link to="/admin/organizers" className={`px-3 py-5 text-sm font-medium flex items-center gap-2 ${isActive('/admin/organizers')}`}>
                      <Users className="w-4 h-4" /> Manage Organizers
                    </Link>
                    <Link to="/admin/reset-requests" className={`px-3 py-5 text-sm font-medium flex items-center gap-2 ${isActive('/admin/reset-requests')}`}>
                      <User className="w-4 h-4" /> Password Resets
                    </Link>
                  </>
                )}

              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {userInfo.role !== 'Admin' && (
                <Link to="/profile" className={`p-2 rounded-full flex items-center gap-2 ${isActive('/profile')}`}>
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">Profile</span>
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="p-2 text-text-secondary hover:text-red-400 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
