const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Convierte un documento de usuario en un objeto plano sin el campo de contraseña.
 * @param {Object} user - Documento de usuario de Mongoose.
 * @returns {Object} Objeto plano del usuario sin la contraseña.
 */
function sanitizeUser(user) {
  const plain = user.toObject ? user.toObject() : user;
  delete plain.password;
  return plain;
}

/**
 * Obtiene todos los usuarios registrados, sin exponer sus contraseñas.
 * @returns {Promise<Array<Object>>} Lista de usuarios ordenada por fecha de creación descendente.
 */
async function getAllUsers() {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  return users;
}

/**
 * Obtiene un usuario por su identificador, sin exponer su contraseña.
 * @param {string} id - Identificador del usuario.
 * @returns {Promise<Object>} Usuario encontrado.
 */
async function getUserById(id) {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw ApiError.notFound('Usuario no encontrado');
  }
  return user;
}

/**
 * Actualiza los datos de un usuario. Permite cambiar nombre, apellido, correo,
 * foto de perfil, y opcionalmente contraseña (validando la actual) o rol (solo administradores).
 * @param {string} id - Identificador del usuario a actualizar.
 * @param {Object} payload - Campos a actualizar (firstName, lastName, email, role, profilePicture, newPassword, currentPassword).
 * @param {Object} requester - Usuario que realiza la solicitud (necesario para validar cambios de rol).
 * @returns {Promise<Object>} Usuario actualizado, sin contraseña.
 */
async function updateUser(id, payload, requester) {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('Usuario no encontrado');
  }

  if (payload.email && payload.email !== user.email) {
    const existing = await User.findOne({ email: payload.email.toLowerCase() });
    if (existing) {
      throw ApiError.conflict('El correo electrónico ya está registrado');
    }
  }

  if (payload.firstName) user.firstName = payload.firstName;
  if (payload.lastName) user.lastName = payload.lastName;
  if (payload.email) user.email = payload.email.toLowerCase();
  if (payload.role) {
    if (!requester || requester.role !== 'administrador') {
      throw ApiError.forbidden('No tiene permisos para cambiar el rol de un usuario');
    }
    // Si se intenta cambiar el rol de un administrador a otro rol diferente:
    if (user.role === 'administrador' && payload.role !== 'administrador') {
      const adminCount = await User.countDocuments({ role: 'administrador' });
      if (adminCount <= 1) {
        throw ApiError.badRequest('No se puede cambiar el rol del único administrador del sistema');
      }
    }
    user.role = payload.role;
  }
  if (payload.profilePicture !== undefined) user.profilePicture = payload.profilePicture;

  if (payload.newPassword) {
    if (!payload.currentPassword) {
      throw ApiError.badRequest('Debes proporcionar tu contraseña actual para cambiarla');
    }
    if (payload.newPassword.length < 8) {
      throw ApiError.badRequest('La nueva contraseña debe tener al menos 8 caracteres');
    }
    // Se vuelve a consultar el usuario incluyendo la contraseña para poder compararla.
    const userWithPassword = await User.findById(id).select('+password');
    const isMatch = await bcrypt.compare(payload.currentPassword, userWithPassword.password);
    if (!isMatch) {
      throw ApiError.unauthorized('La contraseña actual es incorrecta');
    }
    user.password = await bcrypt.hash(payload.newPassword, 10);
  }

  await user.save();
  return sanitizeUser(user);
}

/**
 * Elimina un usuario existente por su identificador.
 * Valida que el usuario logueado no se elimine a sí mismo y que no se elimine el único admin.
 * @param {string} id - Identificador del usuario a eliminar.
 * @param {Object} [requester] - Usuario autenticado que realiza la solicitud.
 * @returns {Promise<void>}
 */
async function deleteUser(id, requester) {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('Usuario no encontrado');
  }

  // Validación 1: No permitir que el usuario se elimine a sí mismo mientras está logueado
  if (requester && (requester.id?.toString() === id.toString() || requester._id?.toString() === id.toString())) {
    throw ApiError.badRequest('No puedes eliminar tu propia cuenta de administrador mientras tienes la sesión iniciada');
  }

  // Validación 2: Si el usuario a eliminar es administrador, verificar que no sea el único en el sistema
  if (user.role === 'administrador') {
    const adminCount = await User.countDocuments({ role: 'administrador' });
    if (adminCount <= 1) {
      throw ApiError.badRequest('No se puede eliminar el administrador porque es el único administrador del sistema');
    }
  }

  await user.deleteOne();
}

// Exporta las funciones del servicio de usuarios.
module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
