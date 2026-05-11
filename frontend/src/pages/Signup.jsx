import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{
        flex: 1, background: '#1a1535', display: 'flex',
        flexDirection: 'column', justifyContent: 'center', padding: '48px'
      }}>
        <div style={{
          width: 44, height: 44, background: '#6c63ff', borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32
        }}>
          <span style={{ color: 'white', fontSize: 22 }}>✦</span>
        </div>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 600, lineHeight: 1.4, marginBottom: 12 }}>
          Start managing<br />your projects today
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7 }}>
          Join your team and collaborate<br />on tasks seamlessly.
        </p>
        <div style={{ display: 'flex', gap: 6, marginTop: 32 }}>
          <div style={{ width: 6, height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ width: 20, height: 6, borderRadius: 4, background: '#6c63ff' }} />
          <div style={{ width: 6, height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>

      <div style={{
        width: 420, background: 'white', display: 'flex',
        flexDirection: 'column', justifyContent: 'center', padding: '48px 40px'
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Create account</h2>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 28 }}>Join your team on TaskFlow</p>

        {error && (
          <div style={{
            background: '#fff0f0', color: '#c00', border: '1px solid #fcc',
            borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Full name</label>
            <input style={inputStyle} type="text" placeholder="John Doe"
              value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email address</label>
            <input style={inputStyle} type="email" placeholder="you@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" placeholder="••••••••"
              value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Role</label>
            <select style={inputStyle} value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button style={btnStyle} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#888' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#6c63ff', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e0deff', borderRadius: 8, fontSize: 13, outline: 'none', color: '#1a1535', background: '#fafafe' };
const btnStyle = { width: '100%', padding: '11px', background: '#6c63ff', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500 };