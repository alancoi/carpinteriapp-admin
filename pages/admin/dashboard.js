import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const BRAND_COLORS = {
  primary: '#FF8C00',
  secondary: '#0D47A1',
  dark: '#0A1B3F',
  light: '#f3f4f6',
  white: '#ffffff',
};

export default function Dashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', plan: 'basico', paymentStatus: 'pendiente' });

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

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify(newUser),
      });
      
      if (res.ok) {
        setShowModal(false);
        setNewUser({ email: '', plan: 'basico', paymentStatus: 'pendiente' });
        fetchUsers();
        alert('✅ Usuario agregado correctamente');
      } else {
        alert('❌ Error al agregar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error');
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
    <div style={{ minHeight: '100vh', background: BRAND_COLORS.light, padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        background: BRAND_COLORS.dark,
        padding: '20px',
        borderRadius: '10px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img 
            src="https://i.postimg.cc/XpQvP00b/image.png" 
            alt="Logo" 
            style={{ height: '50px', width: 'auto' }}
          />
          <h1 style={{ margin: 0, fontSize: '24px' }}>CarpinteríApp Admin</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '10px 20px',
              background: BRAND_COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            ➕ Agregar Usuario
          </button>
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
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <StatBox title="Total Usuarios" value={stats.totalUsuarios} color={BRAND_COLORS.primary} />
          <StatBox title="Usuarios Activos" value={stats.usuariosActivos} color={BRAND_COLORS.secondary} />
          <StatBox title="Plan Básico" value={stats.planesActivos?.basico || 0} color="#10b981" />
          <StatBox title="Plan Premium" value={stats.planesActivos?.premium || 0} color="#8b5cf6" />
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <input
            type="text"
            placeholder="🔍 Buscar por email..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: '10px',
              border: `2px solid ${BRAND_COLORS.primary}`,
              borderRadius: '5px',
              width: '100%',
              maxWidth: '400px',
            }}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: BRAND_COLORS.dark, color: 'white' }}>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600' }}>Plan</th>
              <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Usos Hoy</th>
              <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Pago</th>
              <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>Registrado</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((user, idx) => (
              <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? '#fff' : BRAND_COLORS.light }}>
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
                <td style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: BRAND_COLORS.secondary }}>
                  {20 - (user.usosHoyRestantes || 20)}/20
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <PaymentBadge status={user.paymentStatus} />
                </td>
                <td style={{ padding: '15px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                  {new Date(user.createdAt).toLocaleDateString('es-AR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ padding: '15px', background: BRAND_COLORS.light, borderTop: '1px solid #e5e7eb', color: '#6b7280', fontSize: '14px' }}>
          Mostrando {usuariosFiltrados.length} de {users.length} usuarios
        </div>
      </div>

      {/* Modal para agregar usuario */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: BRAND_COLORS.dark }}>➕ Agregar Usuario</h2>
            
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="usuario@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `2px solid ${BRAND_COLORS.primary}`,
                    borderRadius: '5px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Plan
                </label>
                <select
                  value={newUser.plan}
                  onChange={(e) => setNewUser({...newUser, plan: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `2px solid ${BRAND_COLORS.primary}`,
                    borderRadius: '5px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="basico">📱 Básico (20 usos/día)</option>
                  <option value="premium">⭐ Premium (Ilimitado)</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                  Estado de Pago
                </label>
                <select
                  value={newUser.paymentStatus}
                  onChange={(e) => setNewUser({...newUser, paymentStatus: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `2px solid ${BRAND_COLORS.primary}`,
                    borderRadius: '5px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="pendiente">⏳ Pendiente</option>
                  <option value="pagado">✅ Pagado</option>
                  <option value="falta">❌ Falta Pagar</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#e5e7eb',
                    color: '#333',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: BRAND_COLORS.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

function PaymentBadge({ status }) {
  const statusMap = {
    pagado: { bg: '#dcfce7', color: '#166534', icon: '✅', text: 'Pagado' },
    pendiente: { bg: '#fef3c7', color: '#92400e', icon: '⏳', text: 'Pendiente' },
    falta: { bg: '#fee2e2', color: '#991b1b', icon: '❌', text: 'Falta Pagar' },
  };
  
  const config = statusMap[status] || statusMap.pendiente;
  
  return (
    <span style={{
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: config.bg,
      color: config.color,
    }}>
      {config.icon} {config.text}
    </span>
  );
}
