import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Validar token
    const token = req.headers.authorization?.split(' ')[1];
    if (token !== 'authenticated') {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Validar datos
    const { email, password, plan = 'basico', paymentStatus = 'pendiente' } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({ error: 'Contraseña es requerida' });
    }

    console.log('📝 Intentando crear usuario:', email);

    // Conectar a DB
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    const db = mongoose.connection.db;
    
    // Verificar si existe
    const exists = await db.collection('users').findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hashear contraseña
    console.log('🔐 Hasheando contraseña...');
    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log('✅ Contraseña hasheada');

    // Crear usuario
    const newUser = {
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      plan: plan || 'basico',
      paymentStatus: paymentStatus || 'pendiente',
      usosHoyRestantes: 20,
      ultimoResetUsos: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('💾 Insertando usuario en MongoDB...');
    const result = await db.collection('users').insertOne(newUser);
    console.log('✅ Usuario creado con ID:', result.insertedId);

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
    console.error('❌ ERROR:', error);
    console.error('Stack:', error.stack);
    
    return res.status(500).json({
      error: 'Error al crear usuario',
      details: error.message,
      type: error.name,
    });
  }
}

