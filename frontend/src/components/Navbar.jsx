import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, User, LogOut, Image } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  let userInfo = null;
  try { userInfo = JSON.parse(localStorage.getItem('userInfo')); } catch (_) {}

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  if (!userInfo) return null;

  const isActive = (path) =>
    location.pathname.startsWith(path)
      ? { color: 'var(--text-primary)', borderBottom: '2px solid var(--accent-primary)', paddingBottom: '2px' }
      : { color: 'var(--text-secondary)' };

  const linkStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '0.4rem 0.75rem', fontSize: '0.875rem', fontWeight: 500,
    textDecoration: 'none', transition: 'color 0.2s',
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--glass-border)',
    }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <LayoutDashboard size={18} style={{ color: 'var(--bg-primary)' }} />
            </div>
            <span className="text-gradient" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Infinium</span>
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

            {/* PARTICIPANT */}
            {userInfo.role === 'Participant' && (<>
              <Link to="/dashboard"   style={{ ...linkStyle, ...isActive('/dashboard') }}><LayoutDashboard size={15} /> Dashboard</Link>
              <Link to="/events"      style={{ ...linkStyle, ...isActive('/events') }}><Calendar size={15} /> Events</Link>
              <Link to="/organizers"  style={{ ...linkStyle, ...isActive('/organizers') }}><Users size={15} /> Clubs</Link>
              <Link to="/gallery"     style={{ ...linkStyle, ...isActive('/gallery') }}><Image size={15} /> Gallery</Link>
            </>)}

            {/* ORGANIZER */}
            {userInfo.role === 'Organizer' && (<>
              <Link to="/organizer/dashboard"    style={{ ...linkStyle, ...isActive('/organizer/dashboard') }}><LayoutDashboard size={15} /> Dashboard</Link>
              <Link to="/organizer/create-event" style={{ ...linkStyle, ...isActive('/organizer/create-event') }}><Calendar size={15} /> Create Event</Link>
              <Link to="/events"                 style={{ ...linkStyle, ...isActive('/events') }}><Calendar size={15} /> All Events</Link>
              <Link to="/gallery"                style={{ ...linkStyle, ...isActive('/gallery') }}><Image size={15} /> Gallery</Link>
            </>)}

            {/* ADMIN */}
            {userInfo.role === 'Admin' && (<>
              <Link to="/admin/dashboard"      style={{ ...linkStyle, ...isActive('/admin/dashboard') }}><LayoutDashboard size={15} /> Dashboard</Link>
              <Link to="/admin/organizers"     style={{ ...linkStyle, ...isActive('/admin/organizers') }}><Users size={15} /> Organizers</Link>
              <Link to="/admin/reset-requests" style={{ ...linkStyle, ...isActive('/admin/reset-requests') }}><User size={15} /> Resets</Link>
              <Link to="/events"               style={{ ...linkStyle, ...isActive('/events') }}><Calendar size={15} /> Events</Link>
            </>)}
          </div>

          {/* Right side: Avatar + Profile + Theme + Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* DiceBear Avatar */}
            <img
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(userInfo.email)}&size=32`}
              alt="avatar"
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--glass-border)' }}
            />

            {userInfo.role !== 'Admin' && (
              <Link to="/profile" style={{ ...linkStyle, ...isActive('/profile') }}>
                <User size={15} /> Profile
              </Link>
            )}

            <ThemeToggle />

            <button
              onClick={handleLogout}
              style={{
                ...linkStyle,
                color: 'var(--text-secondary)',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
