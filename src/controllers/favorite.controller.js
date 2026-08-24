const favoriteService = require('../services/favorite.service');

/**
 * Controlador que agrega una actividad a la lista de favoritos del usuario autenticado.
 * Maneja POST /api/favorites/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el usuario autenticado en req.user y el id de la actividad en req.params.id.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function addFavorite(req, res, next) {
  try {
    const favorite = await favoriteService.addFavorite(req.user.id, req.params.id);
    res.status(201).json({
      success: true,
      message: 'Actividad guardada en favoritos',
      data: { favorite },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que elimina una actividad de la lista de favoritos del usuario autenticado.
 * Maneja DELETE /api/favorites/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el usuario autenticado en req.user y el id de la actividad en req.params.id.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function removeFavorite(req, res, next) {
  try {
    await favoriteService.removeFavorite(req.user.id, req.params.id);
    res.json({
      success: true,
      message: 'Actividad removida de favoritos',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que obtiene la lista de actividades favoritas del usuario autenticado.
 * Maneja GET /api/favorites.
 * @param {import('express').Request} req - Solicitud HTTP con el usuario autenticado en req.user.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function getMyFavorites(req, res, next) {
  try {
    const favorites = await favoriteService.getUserFavorites(req.user.id);
    res.json({
      success: true,
      data: { favorites },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que verifica si una actividad específica está marcada como
 * favorita por el usuario autenticado.
 * Maneja GET /api/favorites/:id/status.
 * @param {import('express').Request} req - Solicitud HTTP con el usuario autenticado en req.user y el id de la actividad en req.params.id.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function checkStatus(req, res, next) {
  try {
    const isFavorite = await favoriteService.isFavorite(req.user.id, req.params.id);
    res.json({
      success: true,
      data: { isFavorite },
    });
  } catch (error) {
    next(error);
  }
}

// Exporta los controladores de favoritos para usarlos en las rutas
module.exports = {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkStatus,
};