const ApiError = require('../utils/ApiError');

/**
 * Middleware que se ejecuta cuando ninguna ruta coincide con la solicitud.
 * Genera un error 404 con información del método y la ruta solicitada.
 * @param {import('express').Request} req - Solicitud HTTP recibida.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Pasa el error 404 al manejador de errores.
 * @returns {void}
 */
function notFound(req, res, next) {
  next(ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
}


/**
 * Middleware manejador de errores global de Express. Normaliza distintos
 * tipos de error (validación de Mongoose, clave duplicada, id inválido, etc.)
 * a una respuesta JSON consistente con código de estado HTTP y mensaje.
 * @param {Error} err - Error capturado por la aplicación.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Siguiente middleware (no se usa, pero Express lo requiere para identificar este middleware como manejador de errores).
 * @returns {void}
 */
function errorHandler(err, req, res, next) {
  // Código de estado HTTP a devolver (500 por defecto)
  let statusCode = err.statusCode || 500;
  // Mensaje de error a devolver al cliente
  let message = err.message || 'Error interno del servidor';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err.code === 11000) {
    statusCode = 409;
    // Nombre del campo que causó el conflicto de clave duplicada en MongoDB
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `Ya existe un registro con ese ${field}` : 'Registro duplicado';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Identificador inválido';
  }

  if (!err.isOperational && process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

// Exporta los middlewares de manejo de rutas no encontradas y errores
module.exports = { notFound, errorHandler };