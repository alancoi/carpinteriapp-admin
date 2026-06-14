import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token !== 'authenticated') {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const { email, password, plan, paymentStatus } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Contraseña es requerida' });
    }

    await connectDB();

    // Hashear la contraseña proporcionada por el admin
    const hashedPassword = await bcrypt.hash(password, 10);

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
