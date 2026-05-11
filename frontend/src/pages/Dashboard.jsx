import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../api/axios';

const statusColors = {
  todo: { bg: '#E6F1FB', color: '#0C447C' },
  'in-progress': { bg: '#FAEEDA', color: '#633806' },
  done: { bg: '#E1F5EE', color: '#085041' },
  overdue: { bg: '#FCEBEB', color: '#791F1F' }
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then(res => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>Loading...</p>
      </div>
    </div>
  );

  const stats = data?.stats || {};
  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar title="Dashboard" breadcrumb="Home" />
        <div style={{ padding: 24, flex: 1 }}>

          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Projects', value: stats.totalProjects || 0, icon: '📁', bg: '#EEEDFE', color: '#534AB7' },
              { label: 'Total tasks', value: stats.totalTasks || 0, icon: '✓', bg: '#E1F5EE', color: '#0F6E56' },
              { label: 'In progress', value: stats.inProgressTasks || 0, icon: '⏱', bg: '#FAEEDA', color: '#854F0B' },
              { label: 'Overdue', value: stats.overdueTasks || 0, icon: '⚠', bg: '#FCEBEB', color: '#A32D2D' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'white', border: '1px solid #ebe9fc',
                borderRadius: 12, padding: '16px 18px'
              }}>
                <div style={{
                  width: 34, height: 34, background: s.bg, borderRadius: 9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: s.color, marginBottom: 12
                }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: '#1a1535' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bottom Two Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* My Tasks */}
            <div style={{ background: 'white', border: '1px solid #ebe9fc', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>My tasks</span>
                {data?.myTasks?.length > 3 && (
                  <span onClick={() => setShowAllTasks(!showAllTasks)}
                    style={{ fontSize: 11, color: '#6c63ff', cursor: 'pointer' }}>
                    {showAllTasks ? 'Show less' : `See all (${data.myTasks.length})`}
                  </span>
                )}
              </div>
              {data?.myTasks?.length === 0 && (
                <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', padding: '20px 0' }}>
                  No tasks assigned to you
                </p>
              )}
              {(showAllTasks ? data?.myTasks : data?.myTasks?.slice(0, 3))?.map(task => {
                const over = isOverdue(task);
                const status = over ? 'overdue' : task.status;
                const sc = statusColors[status] || statusColors.todo;
                return (
                  <div key={task.id}
                    onClick={() => navigate(`/projects/${task.projectId}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 0', borderBottom: '1px solid #f0eeff',
                      cursor: 'pointer'
                    }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: sc.color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1535' }}>{task.title}</div>
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
                        {task.project?.name}
                        {task.dueDate && ` · ${new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 20,
                      background: sc.bg, color: sc.color, fontWeight: 500
                    }}>
                      {over ? 'Overdue' : task.status}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Recent Projects */}
            <div style={{ background: 'white', border: '1px solid #ebe9fc', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Recent projects</span>
                <span onClick={() => navigate('/projects')} style={{ fontSize: 11, color: '#6c63ff', cursor: 'pointer' }}>View all</span>
              </div>
              {data?.projects?.length === 0 && (
                <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', padding: '20px 0' }}>No projects yet</p>
              )}
              {data?.projects?.slice(0, 4).map((proj, i) => {
                const colors = ['#6c63ff', '#1D9E75', '#BA7517', '#E24B4A'];
                return (
                  <div key={proj.id} onClick={() => navigate(`/projects/${proj.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 0', borderBottom: '1px solid #f0eeff', cursor: 'pointer'
                    }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: colors[i % 4] + '20',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, color: colors[i % 4], flexShrink: 0
                    }}>📁</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1535' }}>{proj.name}</div>
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>
                        {proj._count?.tasks || 0} tasks
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: '#aaa' }}>→</span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}