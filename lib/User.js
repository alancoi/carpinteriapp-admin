import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: [true, 'Por favor proporciona un email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor proporciona un email válido'
      ],
    },
    password: {
      type: String,
      required: [true, 'Por favor proporciona una contraseña'],
      minlength: 6,
      select: false,
    },
    plan: {
      type: String,
      enum: ['basico', 'premium'],
      default: 'basico',
    },
    usosHoyRestantes: {
      type: Number,
      default: 20,
    },
    ultimoResetUsos: {
      type: Date,
      default: new Date(),
    },
    proyectosGuardados: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevenir sobrescribir el modelo si ya existe
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
