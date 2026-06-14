import { createClient } from '@supabase/supabase-js';
import bcryptjs from 'bcryptjs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

    // Verificar si existe
    const { data: exists } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (exists) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hashear contraseña
    console.log('🔐 Hasheando contraseña...');
    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log('✅ Contraseña hasheada');

    // Crear usuario
    const now = new Date().toISOString();
    const newUser = {
      email: email.trim().toLowerCase(),
      password_hash: hashedPassword,
      plan: plan || 'basico',
      payment_status: paymentStatus || 'pendiente',
      usos_hoy_restantes: 20,
      ultimo_reset_usos: now,
      created_at: now,
      updated_at: now,
    };

    console.log('💾 Insertando usuario en Supabase...');
    const { data: createdUser, error: insertError } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error insertando:', insertError);
      return res.status(500).json({
        error: 'Error al crear usuario',
        details: insertError.message,
      });
    }

    console.log('✅ Usuario creado con ID:', createdUser.id);

    return res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      user: {
        id: createdUser.id,
        email: createdUser.email,
        plan: createdUser.plan,
        paymentStatus: createdUser.payment_status,
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
