const jwt = require('jsonwebtoken');

/**
 * Genera un token JWT firmado con la clave secreta de la aplicación.
 * @param {Object} payload - Datos a incluir en el token (por ejemplo, id y rol del usuario).
 * @returns {string} Token JWT firmado.
 */
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Verifica y decodifica un token JWT usando la clave secreta de la aplicación.
 * @param {string} token - Token JWT a verificar.
 * @returns {Object} Payload decodificado del token si es válido.
 */
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Exporta las utilidades de generación y verificación de tokens JWT.
module.exports = { generateToken, verifyToken };
