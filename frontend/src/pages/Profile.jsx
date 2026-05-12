import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.newPassword !== form.confirmPassword) {
      return setError('New passwords do not match');
    }
    if (form.newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setSuccess('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar title="Profile & Settings" breadcrumb="Home" />
        <div style={{ padding: 24, maxWidth: 560 }}>

          {/* User Info Card */}
          <div style={{ background: 'white', border: '1px solid #ebe9fc', borderRadius: 14, padding: '24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', background: '#6c63ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 600, color: 'white'
              }}>{initials}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1535' }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: '#aaa', marginTop: 2 }}>{user?.email}</div>
                <div style={{
                  display: 'inline-block', marginTop: 6, fontSize: 10, padding: '2px 10px',
                  borderRadius: 20, background: '#EEEDFE', color: '#3C3489', fontWeight: 500
                }}>{user?.role}</div>
              </div>
            </div>
          </div>

          {/* Settings Options */}
          <div style={{ background: 'white', border: '1px solid #ebe9fc', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0eeff' }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Account settings
              </span>
            </div>

            {/* Change Password Row */}
            <div
              onClick={() => { setShowChangePassword(!showChangePassword); setError(''); setSuccess(''); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', cursor: 'pointer', borderBottom: '1px solid #f0eeff',
                background: showChangePassword ? '#fafafe' : 'white'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, background: '#EEEDFE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                }}>🔒</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1535' }}>Change password</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>Update your account password</div>
                </div>
              </div>
              <span style={{ fontSize: 14, color: '#aaa' }}>{showChangePassword ? '▲' : '▶'}</span>
            </div>

            {/* Change Password Form — expands on click */}
            {showChangePassword && (
              <div style={{ padding: '20px', borderBottom: '1px solid #f0eeff', background: '#fafafe' }}>
                {error && (
                  <div style={{ background: '#fff0f0', color: '#c00', border: '1px solid #fcc', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div style={{ background: '#f0fff4', color: '#085041', border: '1px solid #b2f5e0', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
                    {success}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>Current password</label>
                    <input style={inp} type="password" placeholder="••••••••"
                      value={form.currentPassword}
                      onChange={e => setForm({ ...form, currentPassword: e.target.value })} required />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>New password</label>
                    <input style={inp} type="password" placeholder="••••••••"
                      value={form.newPassword}
                      onChange={e => setForm({ ...form, newPassword: e.target.value })} required />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={lbl}>Confirm new password</label>
                    <input style={inp} type="password" placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button"
                      onClick={() => {
                        setShowChangePassword(false);
                        setError(''); setSuccess('');
                        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      style={{ flex: 1, padding: '10px', border: '1px solid #e0deff', borderRadius: 8, background: 'white', color: '#666', fontSize: 13, cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={loading}
                      style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#6c63ff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                      {loading ? 'Changing...' : 'Change password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sign Out Row */}
            <div
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', cursor: 'pointer'
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, background: '#FCEBEB',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                }}>⏻</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#c00' }}>Sign out</div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>Log out of your account</div>
                </div>
              </div>
              <span style={{ fontSize: 14, color: '#aaa' }}>▶</span>
            </div>
          </div>

        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(26,21,53,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
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
    </div>
  );
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 6 };
const inp = { width: '100%', padding: '10px 14px', border: '1px solid #e0deff', borderRadius: 8, fontSize: 13, outline: 'none', color: '#1a1535', background: 'white', boxSizing: 'border-box' };
