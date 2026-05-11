import { useAuth } from '../context/AuthContext';

export default function Topbar({ title, breadcrumb, action }) {
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{
      height: 52, background: 'white', borderBottom: '1px solid #ebe9fc',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {breadcrumb && <span style={{ fontSize: 12, color: '#aaa' }}>{breadcrumb} /</span>}
        <span style={{ fontSize: 14, fontWeight: 500 }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {action}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#f4f3ff', padding: '4px 12px 4px 4px', borderRadius: 20
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: '#6c63ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 600, color: 'white'
          }}>{initials}</div>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#3C3489' }}>{user?.name}</span>
        </div>
      </div>
    </div>
  );
}