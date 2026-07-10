import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light/dark mode"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        color: 'var(--text-primary)',
        flexShrink: 0,
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 12px var(--accent-glow)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
};

export default ThemeToggle;
