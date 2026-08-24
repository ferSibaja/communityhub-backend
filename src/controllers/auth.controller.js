const ApiError = require('../utils/ApiError');
const authService = require('../services/auth.service');

/**
 * Controlador para registrar un nuevo usuario.
 * Maneja POST /api/auth/register: valida los campos obligatorios,
 * crea el usuario y devuelve el usuario junto con un token de sesión.
 * @param {import('express').Request} req - Solicitud HTTP con los datos del usuario en el body.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password, profilePicture } = req.body;

    if (!firstName || !lastName || !email || !password) {
      throw ApiError.badRequest('Nombre, apellido, correo y contraseña son obligatorios');
    }

    if (password.length < 8) {
      throw ApiError.badRequest('La contraseña debe tener al menos 8 caracteres');
    }

    const { user, token } = await authService.register({
      firstName,
      lastName,
      email,
      password,
      profilePicture,
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador para iniciar sesión de un usuario existente.
 * Maneja POST /api/auth/login: valida credenciales y devuelve el usuario
 * junto con un token de autenticación.
 * @param {import('express').Request} req - Solicitud HTTP con email y password en el body.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ApiError.badRequest('Correo y contraseña son obligatorios');
    }

    const { user, token } = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que devuelve la información del usuario autenticado actualmente.
 * Maneja GET /api/auth/me: requiere que el middleware de autenticación
 * haya establecido req.user previamente.
 * @param {import('express').Request} req - Solicitud HTTP con el usuario autenticado en req.user.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function me(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador para cerrar sesión del usuario.
 * Maneja POST /api/auth/logout: como la autenticación es basada en token
 * sin estado en el servidor, solo confirma la acción al cliente.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function logout(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada correctamente',
    });
  } catch (error) {
    next(error);
  }
}

// Exporta los controladores de autenticación para usarlos en las rutas
module.exports = { register, login, me, logout };