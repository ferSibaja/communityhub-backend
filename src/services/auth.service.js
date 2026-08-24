const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateToken } = require('../utils/jwt');

// Número de rondas de sal usadas por bcrypt para el hash de contraseñas.
const SALT_ROUNDS = 10;

/**
 * Registra un nuevo usuario en el sistema.
 * Verifica que el correo no esté en uso, encripta la contraseña,
 * crea el usuario y genera su token de autenticación.
 * @param {Object} params - Datos del nuevo usuario.
 * @param {string} params.firstName - Nombre del usuario.
 * @param {string} params.lastName - Apellido del usuario.
 * @param {string} params.email - Correo electrónico del usuario.
 * @param {string} params.password - Contraseña en texto plano.
 * @param {string} [params.profilePicture] - URL de la foto de perfil (opcional).
 * @returns {Promise<{user: Object, token: string}>} Usuario saneado (sin contraseña) y token JWT generado.
 */
async function register({ firstName, lastName, email, password, profilePicture }) {
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw ApiError.conflict('Ya existe una cuenta registrada con este correo electrónico');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    profilePicture: profilePicture || null,
  });

  const token = generateToken({ id: user._id, role: user.role });

  return { user: sanitizeUser(user), token };
}

/**
 * Inicia sesión de un usuario existente validando sus credenciales.
 * @param {Object} params - Credenciales de inicio de sesión.
 * @param {string} params.email - Correo electrónico del usuario.
 * @param {string} params.password - Contraseña en texto plano a validar.
 * @returns {Promise<{user: Object, token: string}>} Usuario saneado (sin contraseña) y token JWT generado.
 */
async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Correo electrónico o contraseña incorrectos');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Correo electrónico o contraseña incorrectos');
  }

  const token = generateToken({ id: user._id, role: user.role });

  return { user: sanitizeUser(user), token };
}

/**
 * Elimina campos sensibles del documento de usuario antes de exponerlo al cliente.
 * @param {Object} user - Documento de usuario de Mongoose.
 * @returns {Object} Objeto plano con solo los campos seguros del usuario.
 */
function sanitizeUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePicture: user.profilePicture,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// Exporta las funciones del servicio de autenticación.
module.exports = { register, login, sanitizeUser };
