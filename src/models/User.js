const mongoose = require('mongoose');

/**
 * Esquema de Usuario.
 * Representa a una persona registrada en la plataforma, con sus credenciales,
 * datos de perfil y rol dentro del sistema (administrador, organizador o usuario).
 */
const userSchema = new mongoose.Schema(
  {
    /** Nombre(s) del usuario. */
    firstName: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },
    /** Apellido(s) del usuario. */
    lastName: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true,
    },
    /** Correo electrónico único, usado para iniciar sesión. */
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El correo electrónico no es válido'],
    },
    /** Contraseña encriptada del usuario; no se incluye por defecto en las consultas (select: false). */
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: 8,
      select: false,
    },
    /** URL o ruta de la foto de perfil del usuario (opcional). */
    profilePicture: {
      type: String,
      default: null,
    },
    /** Rol del usuario dentro de la plataforma, que determina sus permisos. */
    role: {
      type: String,
      enum: ['administrador', 'organizador', 'usuario'],
      default: 'usuario',
    },
  },
  { timestamps: true } // Agrega automáticamente createdAt y updatedAt
);

// Exporta el modelo 'User' basado en el esquema definido arriba
module.exports = mongoose.model('User', userSchema);