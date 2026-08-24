/**
 * Error operacional personalizado para representar errores de la aplicación
 * con un código de estado HTTP asociado, distinto de errores de programación.
 */
class ApiError extends Error {
  /**
   * Crea una nueva instancia de ApiError.
   * @param {number} statusCode - Código de estado HTTP asociado al error.
   * @param {string} message - Mensaje descriptivo del error.
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    // Marca el error como "operacional" (esperado por la app) para diferenciarlo de bugs internos.
    this.isOperational = true;
  }

  /**
   * Crea un ApiError con código 400 (Solicitud inválida).
   * @param {string} [message] - Mensaje descriptivo del error.
   * @returns {ApiError} Instancia de error 400.
   */
  static badRequest(message = 'Solicitud inválida') {
    return new ApiError(400, message);
  }

  /**
   * Crea un ApiError con código 401 (No autenticado).
   * @param {string} [message] - Mensaje descriptivo del error.
   * @returns {ApiError} Instancia de error 401.
   */
  static unauthorized(message = 'No autenticado') {
    return new ApiError(401, message);
  }

  /**
   * Crea un ApiError con código 403 (No autorizado).
   * @param {string} [message] - Mensaje descriptivo del error.
   * @returns {ApiError} Instancia de error 403.
   */
  static forbidden(message = 'No autorizado') {
    return new ApiError(403, message);
  }

  /**
   * Crea un ApiError con código 404 (Recurso no encontrado).
   * @param {string} [message] - Mensaje descriptivo del error.
   * @returns {ApiError} Instancia de error 404.
   */
  static notFound(message = 'Recurso no encontrado') {
    return new ApiError(404, message);
  }

  /**
   * Crea un ApiError con código 409 (Conflicto con el estado actual del recurso).
   * @param {string} [message] - Mensaje descriptivo del error.
   * @returns {ApiError} Instancia de error 409.
   */
  static conflict(message = 'Conflicto con el estado actual del recurso') {
    return new ApiError(409, message);
  }
}

// Exporta la clase de error personalizado para uso en toda la aplicación.
module.exports = ApiError;
