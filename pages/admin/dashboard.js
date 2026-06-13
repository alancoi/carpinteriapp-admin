import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [planFiltro, setPlanFiltro] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` },
      });
      const data = await res.json();
      setUsers(data.users);
      setStats(data.stats);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = users.filter(u => {
    const matchFiltro = u.email.toLowerCase().includes(filtro.toLowerCase());
    const matchPlan = planFiltro === 'todos' || u.plan === planFiltro;
    return matchFiltro && matchPlan;
  });

  const exportarExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const data = usuariosFiltrados.map(u => ({
        Email: u.email,
        Plan: u.plan,
        'Usos Hoy': 20 - u.usosHoyRestantes,
        'Registrado': new Date(u.createdAt).toLocaleDateString('es-AR'),
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
      XLSX.writeFile(wb, 'carpinteriapp-clientes.xlsx');
    } catch (error) {
      console.error('Error exportando Excel:', error);
      alert('Error al exportar Excel');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/');
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Cargando...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0, color: '#1f2937' }}>📊 Panel de Administrador</h1>
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

      {/* Estadísticas */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Total de Usuarios</p>
            <p style={{ color: '#1f2937', fontSize: '32px', margin: 0, fontWeight: '700' }}>{stats.totalUsuarios}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Usuarios Activos (7d)</p>
            <p style={{ color: '#3b82f6', fontSize: '32px', margin: 0, fontWeight: '700' }}>{stats.usuariosActivos}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Plan Básico</p>
            <p style={{ color: '#10b981', fontSize: '32px', margin: 0, fontWeight: '700' }}>{stats.planesActivos.basico}</p>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Plan Premium</p>
            <p style={{ color: '#f59e0b', fontSize: '32px', margin: 0, fontWeight: '700' }}>{stats.planesActivos.premium}</p>
          </div>
        </div>
      )}

      {/* Filtros y Tabla */}
      <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por email..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              flex: 1,
              minWidth: '200px',
            }}
          />
          <select
            value={planFiltro}
            onChange={(e) => setPlanFiltro(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
            }}
          >
            <option value="todos">Todos los planes</option>
            <option value="basico">Plan Básico</option>
            <option value="premium">Plan Premium</option>
          </select>
          <button
            onClick={exportarExcel}
            style={{
              padding: '10px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            📥 Exportar Excel
          </button>
        </div>

        {/* Tabla */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Email</th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#1f2937' }}>Plan</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Usos Hoy</th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#1f2937' }}>Registrado</th>
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
                      {user.plan === 'basico' ? '📱 Básico' : '⭐ Premium'}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '5px',
                      background: '#f3e8ff',
                      color: '#6d28d9',
                      fontWeight: '600',
                    }}>
                      {20 - user.usosHoyRestantes}/20
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                    {new Date(user.createdAt).toLocaleDateString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '15px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', color: '#6b7280', fontSize: '14px' }}>
          Mostrando {usuariosFiltrados.length} de {users.length} usuarios
        </div>
      </div>
    </div>
  );
}
