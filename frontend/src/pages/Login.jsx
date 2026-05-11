import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

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
          Manage your team<br />tasks with ease
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.7 }}>
          Assign tasks, track progress,<br />and ship faster together.
        </p>
        <div style={{ display: 'flex', gap: 6, marginTop: 32 }}>
          <div style={{ width: 20, height: 6, borderRadius: 4, background: '#6c63ff' }} />
          <div style={{ width: 6, height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ width: 6, height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>

      <div style={{
        width: 420, background: 'white', display: 'flex',
        flexDirection: 'column', justifyContent: 'center', padding: '48px 40px'
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Welcome back</h2>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 28 }}>Sign in to continue to TaskFlow</p>

        {error && (
          <div style={{
            background: '#fff0f0', color: '#c00', border: '1px solid #fcc',
            borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email address</label>
            <input style={inputStyle} type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={labelStyle}>Password</label>
            <input style={inputStyle} type="password" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: '#6c63ff', cursor: 'pointer' }}>Forgot password?</span>
          </div>
          <button style={btnStyle} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#888' }}>
          No account?{' '}
          <Link to="/signup" style={{ color: '#6c63ff', fontWeight: 500 }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 500,
  color: '#555', marginBottom: 6
};

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1px solid #e0deff', borderRadius: 8,
  fontSize: 13, outline: 'none', color: '#1a1535',
  background: '#fafafe'
};

const btnStyle = {
  width: '100%', padding: '11px',
  background: '#6c63ff', color: 'white',
  border: 'none', borderRadius: 8,
  fontSize: 14, fontWeight: 500
};