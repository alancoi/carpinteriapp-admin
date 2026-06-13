import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
      });
      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = users.filter(u => 
    u.email.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/');
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Cargando...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#1f2937' }}>📊 Admin - CarpinteríApp</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          Salir
        </button>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <StatBox title="Total Usuarios" value={stats.totalUsuarios} color="#3b82f6" />
          <StatBox title="Usuarios Activos" value={stats.usuariosActivos} color="#10b981" />
          <StatBox title="Plan Básico" value={stats.planesActivos?.basico || 0} color="#f59e0b" />
          <StatBox title="Plan Premium" value={stats.planesActivos?.premium || 0} color="#8b5cf6" />
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por email..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              width: '100%',
              maxWidth: '400px',
            }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Plan</th>
              <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Usos Hoy</th>
              <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Registrado</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((user, idx) => (
              <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                <td style={{ padding: '15px' }}>{user.email}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: user.plan === 'basico' ? '#dbeafe' : '#fef08a',
                    color: user.plan === 'basico' ? '#1e40af' : '#713f12',
                  }}>
                    {user.plan === 'basico' ? 'Básico' : 'Premium'}
                  </span>
                </td>
                <td style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#6d28d9' }}>
                  {20 - user.usosHoyRestantes}/20
                </td>
                <td style={{ padding: '15px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                  {new Date(user.createdAt).toLocaleDateString('es-AR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '15px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', color: '#6b7280', fontSize: '14px' }}>
          Mostrando {usuariosFiltrados.length} de {users.length} usuarios
        </div>
      </div>
    </div>
  );
}

function StatBox({ title, value, color }) {
  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>{title}</p>
      <p style={{ color: color, fontSize: '32px', margin: 0, fontWeight: '700' }}>{value}</p>
    </div>
  );
}
