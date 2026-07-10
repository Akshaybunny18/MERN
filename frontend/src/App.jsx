import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginCard from './components/LoginCard';
import RegisterCard from './components/RegisterCard';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Profile from './components/Profile';
import BrowseEvents from './components/events/BrowseEvents';
import EventDetails from './components/events/EventDetails';
import ClubsList from './components/organizers/ClubsList';
import ClubDetails from './components/organizers/ClubDetails';
import OrganizerDashboard from './components/organizers/OrganizerDashboard';
import CreateEvent from './components/organizers/CreateEvent';
import EventDetailOrganizer from './components/organizers/EventDetailOrganizer';
import AdminDashboard from './components/admin/AdminDashboard';
import ManageOrganizers from './components/admin/ManageOrganizers';
import PasswordResetRequests from './components/admin/PasswordResetRequests';
import Gallery from './components/Gallery';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute';
import ParticlesBackground from './components/ParticlesBackground';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

// ─── Typewriter ───────────────────────────────────────────────────────────────
const Typewriter = ({ text, onComplete, skip }) => {
  const [displayText, setDisplayText] = React.useState('');

  React.useEffect(() => {
    if (skip) {
      setDisplayText(text);
      if (onComplete) onComplete();
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 100);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, skip]);

  return <span>{displayText}</span>;
};

// ─── Landing Page ─────────────────────────────────────────────────────────────
const LandingPage = () => {
  const [typingComplete, setTypingComplete] = React.useState(false);
  const [skipAnimation, setSkipAnimation] = React.useState(false);

  const handleSkip = () => {
    if (!typingComplete) {
      setSkipAnimation(true);
      setTypingComplete(true);
    }
  };

  return (
    <div 
      onClick={handleSkip}
      style={{
      position: 'relative', padding: '4rem 2rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', overflow: 'hidden',
      cursor: typingComplete ? 'default' : 'pointer'
    }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20 }}>
        <ThemeToggle />
      </div>
      <ParticlesBackground />
      <div className="glass-panel animate-fade-in" style={{
        padding: '3rem', maxWidth: '800px', width: '100%',
        textAlign: 'center', position: 'relative', zIndex: 10,
      }}>
        <h1 className="text-gradient animate-float" style={{ fontSize: '3.5rem', marginBottom: '1rem', minHeight: '4.5rem' }}>
          <Typewriter text="Welcome to Infinium" onComplete={() => setTypingComplete(true)} skip={skipAnimation} />
          {!typingComplete && <span style={{ animation: 'none', opacity: 0.7 }}>|</span>}
        </h1>

        <div style={{ opacity: typingComplete ? 1 : 0, transition: 'opacity 1s ease-in-out' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '1rem' }}>
            IIIT Hyderabad's Annual Tech Fest
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Participate in exciting events, explore workshops, and connect with organizers.<br />
            Join us for an unforgettable experience!
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" className="btn btn-primary no-underline font-bold"
               style={{ color: 'var(--btn-primary-text)' }}>
              Get Started
            </a>
            <a href="/login" className="btn glass-panel no-underline font-bold"
               style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth pages redirect logged-in users to their dashboard */}
          <Route path="/login"    element={<PublicOnlyRoute><LoginCard /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterCard /></PublicOnlyRoute>} />

          {/* ── Any authenticated user ── */}
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/gallery"    element={<ProtectedRoute><Gallery /></ProtectedRoute>} />

          {/* ── Participant only ── */}
          <Route path="/dashboard"        element={<ProtectedRoute roles={['Participant']}><Dashboard /></ProtectedRoute>} />
          <Route path="/events"           element={<ProtectedRoute roles={['Participant', 'Organizer', 'Admin']}><BrowseEvents /></ProtectedRoute>} />
          <Route path="/events/:id"       element={<ProtectedRoute roles={['Participant', 'Organizer', 'Admin']}><EventDetails /></ProtectedRoute>} />
          <Route path="/organizers"       element={<ProtectedRoute roles={['Participant']}><ClubsList /></ProtectedRoute>} />
          <Route path="/organizers/:id"   element={<ProtectedRoute roles={['Participant']}><ClubDetails /></ProtectedRoute>} />

          {/* ── Organizer only ── */}
          <Route path="/organizer/dashboard"    element={<ProtectedRoute roles={['Organizer']}><OrganizerDashboard /></ProtectedRoute>} />
          <Route path="/organizer/create-event" element={<ProtectedRoute roles={['Organizer']}><CreateEvent /></ProtectedRoute>} />
          <Route path="/organizer/events/:id"   element={<ProtectedRoute roles={['Organizer']}><EventDetailOrganizer /></ProtectedRoute>} />

          {/* ── Admin only ── */}
          <Route path="/admin/dashboard"      element={<ProtectedRoute roles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/organizers"     element={<ProtectedRoute roles={['Admin']}><ManageOrganizers /></ProtectedRoute>} />
          <Route path="/admin/reset-requests" element={<ProtectedRoute roles={['Admin']}><PasswordResetRequests /></ProtectedRoute>} />

          {/* ── Error pages ── */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
