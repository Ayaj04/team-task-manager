import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: '⊞', label: 'Dashboard', path: '/dashboard' },
  { icon: '📁', label: 'Projects', path: '/projects' },
  { icon: '👤', label: 'Profile', path: '/profile' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <>
      <div style={{
        width: 56, background: '#1a1535', display: 'flex',
        flexDirection: 'column', alignItems: 'center',
        padding: '16px 0', minHeight: '100vh', position: 'sticky', top: 0
      }}>
        {/* Logo */}
        <div style={{
          width: 34, height: 34, background: '#6c63ff', borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, fontSize: 16, color: 'white', cursor: 'pointer'
        }} onClick={() => navigate('/dashboard')}>✦</div>

        {/* Back Button */}
        <button onClick={() => navigate(-1)} title="Go back"
          style={{
            width: 38, height: 38, borderRadius: 10, border: 'none',
            background: 'transparent', color: 'rgba(255,255,255,0.4)',
            fontSize: 18, cursor: 'pointer', marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>←</button>

        {/* Nav Items */}
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              title={item.label}
              style={{
                width: 38, height: 38, borderRadius: 10, border: 'none',
                background: active ? 'rgba(108,99,255,0.25)' : 'transparent',
                color: active ? '#a89dff' : 'rgba(255,255,255,0.4)',
                fontSize: 18, cursor: 'pointer', marginBottom: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              {item.icon}
            </button>
          );
        })}

        {/* Logout at bottom */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title="Logout"
            style={{
              width: 38, height: 38, borderRadius: 10, border: 'none',
              background: 'rgba(255,99,99,0.1)', color: 'rgba(255,120,120,0.7)',
              fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>⏻</button>
          <div onClick={() => navigate('/profile')}
            style={{
              width: 34, height: 34, borderRadius: '50%', background: '#6c63ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: 'white', cursor: 'pointer'
            }}>{initials}</div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(26,21,53,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200
        }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '32px', width: 360, textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: '#FCEBEB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, margin: '0 auto 16px'
            }}>⏻</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1535', marginBottom: 8 }}>Sign out?</h3>
            <p style={{ fontSize: 13, color: '#aaa', marginBottom: 24, lineHeight: 1.6 }}>
              Are you sure you want to sign out of your account?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowLogoutConfirm(false)} style={{
                flex: 1, padding: '11px', border: '1px solid #e0deff',
                borderRadius: 8, background: 'white', color: '#555',
                fontSize: 13, fontWeight: 500, cursor: 'pointer'
              }}>No, stay</button>
              <button onClick={() => { logout(); navigate('/login'); }} style={{
                flex: 1, padding: '11px', border: 'none',
                borderRadius: 8, background: '#c00', color: 'white',
                fontSize: 13, fontWeight: 500, cursor: 'pointer'
              }}>Yes, sign out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
