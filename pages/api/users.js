import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token !== 'admin_token') {
      return res.status(401).json({ error: 'No autorizado' });
    }

    await connectDB();

    // Obtener usuarios directamente de MongoDB sin modelo
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();

    // Calcular estadísticas
    const stats = {
      totalUsuarios: users.length,
      usuariosActivos: users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      planesActivos: {
        basico: users.filter(u => u.plan === 'basico').length,
        premium: users.filter(u => u.plan === 'premium').length,
      },
      usosPromedioHoy: users.length > 0 ? (users.reduce((sum, u) => sum + (20 - (u.usosHoyRestantes || 0)), 0) / users.length).toFixed(2) : 0,
    };

    return res.status(200).json({
      success: true,
      users: users.map(u => ({
        _id: u._id,
        email: u.email,
        plan: u.plan || 'basico',
        usosHoyRestantes: u.usosHoyRestantes || 20,
        paymentStatus: u.paymentStatus || 'pendiente',
        createdAt: u.createdAt,
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
