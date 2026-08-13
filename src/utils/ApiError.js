class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }

  static badRequest(message = 'Solicitud inválida') {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'No autenticado') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'No autorizado') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Recurso no encontrado') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflicto con el estado actual del recurso') {
    return new ApiError(409, message);
  }
}

module.exports = ApiError;