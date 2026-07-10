import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();
  let userInfo = null;
  try { userInfo = JSON.parse(localStorage.getItem('userInfo')); } catch (_) {}
  const dashMap = { Admin: '/admin/dashboard', Organizer: '/organizer/dashboard', Participant: '/dashboard' };
  const home = dashMap[userInfo?.role] || '/';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', color: 'var(--text-primary)',
      textAlign: 'center', padding: '2rem',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🚫</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Access Denied</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px' }}>
        You don't have permission to view this page. This area is restricted to authorized roles only.
      </p>
      <Link to={home} className="btn btn-primary" style={{ color: 'var(--btn-primary-text)' }}>
        Go to My Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
