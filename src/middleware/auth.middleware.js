const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');


/**
 * Middleware de autenticación. Verifica que la solicitud incluya un token
 * JWT válido en el header Authorization ("Bearer <token>"), busca al usuario
 * correspondiente en la base de datos y adjunta sus datos a req.user.
 * @param {import('express').Request} req - Solicitud HTTP, debe incluir el header Authorization.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Continúa al siguiente middleware/controlador o pasa el error.
 * @returns {Promise<void>}
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No se proporcionó un token de autenticación');
    }

    // Token JWT extraído del header Authorization
    const token = authHeader.split(' ')[1];
    // Payload decodificado del token (incluye el id del usuario)
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user) {
      throw ApiError.unauthorized('El usuario asociado a este token ya no existe');
    }

    // Datos del usuario autenticado que quedan disponibles en req.user para el resto de la petición
    req.user = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token inválido o expirado'));
    }
    next(error);
  }
}

/**
 * Middleware factory de autorización por roles. Genera un middleware que
 * permite continuar solo si el usuario autenticado tiene uno de los roles
 * permitidos.
 * @param {...string} allowedRoles - Lista de roles permitidos para acceder a la ruta.
 * @returns {import('express').RequestHandler} Middleware de Express que valida el rol del usuario.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('No autenticado'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('No tiene permisos para realizar esta acción'));
    }

    next();
  };
}

// Exporta los middlewares de autenticación y autorización para usarlos en las rutas
module.exports = { authenticate, authorize };