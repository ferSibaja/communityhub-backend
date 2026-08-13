const ApiError = require('../utils/ApiError');
const authService = require('../services/auth.service');

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

module.exports = { register, login, me, logout };