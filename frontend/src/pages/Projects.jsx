import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api/axios';

const colors = ['#6c63ff', '#1D9E75', '#BA7517', '#E24B4A', '#185FA5', '#993556'];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = () => {
    api.get('/projects').then(res => {
      setProjects(res.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '' });
      setShowModal(false);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const action = (
    <button onClick={() => setShowModal(true)} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: '#6c63ff', color: 'white', border: 'none',
      borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 500
    }}>
      + New project
    </button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar title="Projects" breadcrumb="Home" action={action} />
        <div style={{ padding: 24 }}>
          {loading ? (
            <p style={{ color: '#aaa', fontSize: 13 }}>Loading...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {projects.map((proj, i) => {
                const color = colors[i % colors.length];
                const initials = proj.name.slice(0, 2).toUpperCase();
                const total = proj._count?.tasks || 0;
                const adminMember = proj.members?.find(m => m.role === 'admin');
                return (
                  <div key={proj.id} onClick={() => navigate(`/projects/${proj.id}`)}
                    style={{
                      background: 'white', border: '1px solid #ebe9fc',
                      borderRadius: 14, padding: '20px', cursor: 'pointer',
                      transition: 'box-shadow 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(108,99,255,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 11,
                        background: color + '18', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 600, color
                      }}>{initials}</div>
                      <span style={{
                        fontSize: 10, padding: '3px 9px', borderRadius: 20,
                        background: '#EEEDFE', color: '#3C3489', fontWeight: 500
                      }}>Admin</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1535', marginBottom: 6 }}>{proj.name}</div>
                    <div style={{ fontSize: 12, color: '#aaa', marginBottom: 16, lineHeight: 1.5 }}>
                      {proj.description || 'No description'}
                    </div>
                    <div style={{ height: 3, background: '#f0eeff', borderRadius: 4, marginBottom: 14, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '40%', background: color, borderRadius: 4 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex' }}>
                        {proj.members?.slice(0, 3).map((m, mi) => (
                          <div key={m.id} style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: colors[mi % colors.length],
                            border: '2px solid white', marginLeft: mi === 0 ? 0 : -6,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 8, fontWeight: 600, color: 'white'
                          }}>
                            {m.user?.name?.slice(0, 2).toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: '#aaa' }}>{total} tasks</span>
                    </div>
                  </div>
                );
              })}

              {/* New Project Card */}
              <div onClick={() => setShowModal(true)} style={{
                border: '1.5px dashed #c4bfff', borderRadius: 14, padding: '20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', minHeight: 160, cursor: 'pointer', gap: 8
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11, background: '#f4f3ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, color: '#6c63ff'
                }}>+</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#6c63ff' }}>New project</div>
                <div style={{ fontSize: 11, color: '#aaa' }}>Start from scratch</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(26,21,53,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: '28px 32px',
            width: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Create new project</h3>
              <button onClick={() => setShowModal(false)} style={{
                border: 'none', background: 'none', fontSize: 20,
                color: '#aaa', cursor: 'pointer', lineHeight: 1
              }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Project name</label>
                <input style={inp} placeholder="e.g. Website Redesign"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={lbl}>Description (optional)</label>
                <textarea style={{ ...inp, height: 80, resize: 'vertical' }}
                  placeholder="What is this project about?"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1, padding: '10px', border: '1px solid #e0deff',
                  borderRadius: 8, background: 'white', color: '#666',
                  fontSize: 13, cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" disabled={creating} style={{
                  flex: 1, padding: '10px', border: 'none',
                  borderRadius: 8, background: '#6c63ff', color: 'white',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer'
                }}>{creating ? 'Creating...' : 'Create project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 6 };
const inp = { width: '100%', padding: '10px 14px', border: '1px solid #e0deff', borderRadius: 8, fontSize: 13, outline: 'none', color: '#1a1535', background: '#fafafe', boxSizing: 'border-box' };