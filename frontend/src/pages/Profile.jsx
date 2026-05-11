import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
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

            {/* Logout Button */}
            <button onClick={() => { logout(); navigate('/login'); }} style={{
              width: '100%', padding: '10px', border: '1px solid #fcc',
              borderRadius: 8, background: '#fff5f5', color: '#c00',
              fontSize: 13, fontWeight: 500, cursor: 'pointer'
            }}>
              Sign out
            </button>
          </div>

          {/* Change Password Card */}
          <div style={{ background: 'white', border: '1px solid #ebe9fc', borderRadius: 14, padding: '24px' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, color: '#1a1535' }}>Change password</h3>

            {error && <div style={{ background: '#fff0f0', color: '#c00', border: '1px solid #fcc', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: '#f0fff4', color: '#085041', border: '1px solid #b2f5e0', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>{success}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Current password</label>
                <input style={inp} type="password" placeholder="••••••••"
                  value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>New password</label>
                <input style={inp} type="password" placeholder="••••••••"
                  value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Confirm new password</label>
                <input style={inp} type="password" placeholder="••••••••"
                  value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '11px', background: '#6c63ff',
                color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer'
              }}>{loading ? 'Changing...' : 'Change password'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 6 };
const inp = { width: '100%', padding: '10px 14px', border: '1px solid #e0deff', borderRadius: 8, fontSize: 13, outline: 'none', color: '#1a1535', background: '#fafafe', boxSizing: 'border-box' };
