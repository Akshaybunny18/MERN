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

import './index.css';

// Original App component content renamed for demo purposes
const LandingPage = () => {
  return (
    <div className="app-container" style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        <h1 className="text-gradient animate-float" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
          Welcome to Infinium
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2.5rem' }}>
          A premium, high-performance tech stack starting point.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/register" className="btn btn-primary no-underline text-white">
            Get Started
          </a>
          <a href="/login" className="btn glass-panel no-underline text-white" style={{ background: 'transparent', padding: '0.75rem 1.5rem', borderRadius: '9999px', cursor: 'pointer', border: '1px solid var(--glass-border)' }}>
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginCard />} />
        <Route path="/register" element={<RegisterCard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<BrowseEvents />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/organizers" element={<ClubsList />} />
        <Route path="/organizers/:id" element={<ClubDetails />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Organizer Routes */}
        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/create-event" element={<CreateEvent />} />
        <Route path="/organizer/events/:id" element={<EventDetailOrganizer />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/organizers" element={<ManageOrganizers />} />
        <Route path="/admin/reset-requests" element={<PasswordResetRequests />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
