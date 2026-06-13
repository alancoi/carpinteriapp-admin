import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token !== 'admin_token') {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { email, plan, paymentStatus } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    await connectDB();

    // Generar contraseña aleatoria
    const tempPassword = Math.random().toString(36).substring(2, 10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Crear usuario en MongoDB
    const db = mongoose.connection.db;
    
    // Verificar si ya existe
    const exists = await db.collection('users').findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const newUser = {
      email,
      password: hashedPassword,
      plan: plan || 'basico',
      paymentStatus: paymentStatus || 'pendiente',
      usosHoyRestantes: 20,
      ultimoResetUsos: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);

    return res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      tempPassword: tempPassword,
      user: {
        _id: result.insertedId,
        email: newUser.email,
        plan: newUser.plan,
        paymentStatus: newUser.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    return res.status(500).json({
      error: 'Error al crear usuario',
      details: error.message,
    });
  }
}
