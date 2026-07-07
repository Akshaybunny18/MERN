import React from 'react';
import './index.css';

function App() {
  return (
    <div className="app-container" style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        <h1 className="text-gradient animate-float" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
          Welcome to MERN
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2.5rem' }}>
          A premium, high-performance tech stack starting point.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary">
            Get Started
          </button>
          <button className="btn glass-panel" style={{ background: 'transparent', padding: '0.75rem 1.5rem', borderRadius: '9999px', cursor: 'pointer', color: 'white', border: '1px solid var(--glass-border)' }}>
            Documentation
          </button>
        </div>

        <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
            <h3 style={{ color: 'var(--accent-neon)', marginBottom: '0.5rem' }}>MongoDB</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Flexible, scalable NoSQL database.</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Express</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fast, unopinionated web framework.</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
            <h3 style={{ color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>React</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>A UI library for complex interfaces.</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'left' }}>
            <h3 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>Node.js</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>JavaScript runtime environment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
