import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api/axios';

const columns = [
  { key: 'todo', label: 'Todo', bg: '#E6F1FB', color: '#0C447C' },
  { key: 'in-progress', label: 'In Progress', bg: '#FAEEDA', color: '#633806' },
  { key: 'done', label: 'Done', bg: '#E1F5EE', color: '#085041' },
];

const avatarColors = ['#6c63ff', '#1D9E75', '#BA7517', '#E24B4A', '#185FA5'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ moved to top - hooks must be before any return

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assignedToId: '', dueDate: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(null);

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (e) {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post(`/projects/${id}/tasks`, {
        ...form,
        assignedToId: form.assignedToId || undefined,
        dueDate: form.dueDate || undefined
      });
      setForm({ title: '', description: '', assignedToId: '', dueDate: '' });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingTask(taskId);
    try {
      await api.patch(`/projects/${id}/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (e) {
      alert('Failed to update task');
    } finally {
      setUpdatingTask(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (e) {
      alert('Failed to delete task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: 'member' });
      setMemberEmail('');
      setShowMemberModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>Loading...</p>
      </div>
    </div>
  );

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  // ✅ now safe to use user here since hook is at top
  const myMembership = project?.members?.find(m => m.userId === user?.id);
  const isAdmin = myMembership?.role === 'admin';

  const action = (
    <div style={{ display: 'flex', gap: 8 }}>
      {isAdmin && (
        <button onClick={() => setShowMemberModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'white', color: '#6c63ff', border: '1px solid #e0deff',
          borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer'
        }}>+ Add member</button>
      )}
      <button onClick={() => setShowModal(true)} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#6c63ff', color: 'white', border: 'none',
        borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer'
      }}>+ Add task</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar title={project?.name} breadcrumb="Projects" action={action} />

        {/* Members bar */}
        <div style={{
          background: 'white', borderBottom: '1px solid #ebe9fc',
          padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span style={{ fontSize: 11, color: '#aaa' }}>Members:</span>
          <div style={{ display: 'flex' }}>
            {project?.members?.map((m, i) => (
              <div key={m.id} title={m.user?.name} style={{
                width: 28, height: 28, borderRadius: '50%',
                background: avatarColors[i % avatarColors.length],
                border: '2px solid white', marginLeft: i === 0 ? 0 : -8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 600, color: 'white'
              }}>
                {m.user?.name?.slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 11, color: '#aaa' }}>
            {project?.members?.length} member{project?.members?.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Kanban Board */}
        <div style={{ padding: 24, flex: 1, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {columns.map(col => (
            <div key={col.key} style={{ flex: 1, minWidth: 0 }}>
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 500, color: col.color,
                    background: col.bg, padding: '3px 10px', borderRadius: 20
                  }}>{col.label}</span>
                  <span style={{
                    fontSize: 11, color: '#aaa', background: '#f0eeff',
                    padding: '2px 7px', borderRadius: 20
                  }}>{tasksByStatus(col.key).length}</span>
                </div>
              </div>

              {/* Task Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tasksByStatus(col.key).map(task => (
                  <div key={task.id} style={{
                    background: 'white', border: '1px solid #ebe9fc',
                    borderRadius: 12, padding: '14px',
                    opacity: updatingTask === task.id ? 0.6 : 1
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1535', flex: 1, lineHeight: 1.4 }}>
                        {task.title}
                      </div>
                      {isAdmin && (
                        <button onClick={() => handleDeleteTask(task.id)} style={{
                          border: 'none', background: 'none', color: '#ddd',
                          cursor: 'pointer', fontSize: 14, padding: '0 0 0 8px', lineHeight: 1
                        }}>×</button>
                      )}
                    </div>

                    {task.description && (
                      <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10, lineHeight: 1.5 }}>
                        {task.description}
                      </div>
                    )}

                    {/* Assignee & Due Date */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      {task.assignedTo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 20, height: 20, borderRadius: '50%', background: '#6c63ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 8, fontWeight: 600, color: 'white'
                          }}>{task.assignedTo.name?.slice(0, 2).toUpperCase()}</div>
                          <span style={{ fontSize: 11, color: '#888' }}>{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#ccc' }}>Unassigned</span>
                      )}
                      {task.dueDate && (
                        <span style={{ fontSize: 10, color: '#aaa' }}>
                          📅 {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>

                    {/* Status Buttons */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {columns.filter(c => c.key !== col.key).map(c => (
                        <button key={c.key} onClick={() => handleStatusChange(task.id, c.key)}
                          style={{
                            flex: 1, padding: '4px 6px', border: '1px solid #e0deff',
                            borderRadius: 6, background: 'white', fontSize: 10,
                            color: '#888', cursor: 'pointer'
                          }}>
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Empty state */}
                {tasksByStatus(col.key).length === 0 && (
                  <div style={{ border: '1.5px dashed #e0deff', borderRadius: 12, padding: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#ccc' }}>No tasks</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(26,21,53,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', width: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Add new task</h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: 20, color: '#aaa', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Task title</label>
                <input style={inp} placeholder="e.g. Design landing page"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Description (optional)</label>
                <textarea style={{ ...inp, height: 70, resize: 'vertical' }}
                  placeholder="Task details..."
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={lbl}>Assign to</label>
                  <select style={inp} value={form.assignedToId}
                    onChange={e => setForm({ ...form, assignedToId: e.target.value })}>
                    <option value="">Unassigned</option>
                    {project?.members?.map(m => (
                      <option key={m.userId} value={m.userId}>{m.user?.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Due date</label>
                  <input style={inp} type="date"
                    value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" disabled={creating} style={submitBtn}>
                  {creating ? 'Adding...' : 'Add task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(26,21,53,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '28px 32px', width: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Add member</h3>
              <button onClick={() => setShowMemberModal(false)} style={{ border: 'none', background: 'none', fontSize: 20, color: '#aaa', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleAddMember}>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Member email</label>
                <input style={inp} type="email" placeholder="teammate@example.com"
                  value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
                <p style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                  The person must already have an account.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowMemberModal(false)} style={cancelBtn}>Cancel</button>
                <button type="submit" disabled={addingMember} style={submitBtn}>
                  {addingMember ? 'Adding...' : 'Add member'}
                </button>
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
const cancelBtn = { flex: 1, padding: '10px', border: '1px solid #e0deff', borderRadius: 8, background: 'white', color: '#666', fontSize: 13, cursor: 'pointer' };
const submitBtn = { flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#6c63ff', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
 