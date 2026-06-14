import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token !== 'authenticated') {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Obtener usuarios de Supabase
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error obteniendo usuarios:', fetchError);
      return res.status(500).json({
        error: 'Error al obtener usuarios',
        details: fetchError.message,
      });
    }

    const usersList = users || [];

    // Calcular estadísticas
    const stats = {
      totalUsuarios: usersList.length,
      usuariosActivos: usersList.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      planesActivos: {
        basico: usersList.filter(u => u.plan === 'basico').length,
        premium: usersList.filter(u => u.plan === 'premium').length,
      },
      usosPromedioHoy: usersList.length > 0 ? (usersList.reduce((sum, u) => sum + (20 - (u.usos_hoy_restantes || 0)), 0) / usersList.length).toFixed(2) : 0,
    };

    return res.status(200).json({
      success: true,
      users: usersList.map(u => ({
        id: u.id,
        email: u.email,
        plan: u.plan || 'basico',
        usosHoyRestantes: u.usos_hoy_restantes || 20,
        paymentStatus: u.payment_status || 'pendiente',
        createdAt: u.created_at,
      })),
      stats,
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return res.status(500).json({
      error: 'Error al obtener usuarios',
      details: error.message,
    });
  }
}
