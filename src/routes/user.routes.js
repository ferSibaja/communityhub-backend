const express = require('express');
const userController = require('../controllers/user.controller');
const registrationController = require('../controllers/registration.controller');
const favoriteController = require('../controllers/favorite.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Rutas de usuarios: datos propios (registros, favoritos, avatar) y administración de cuentas,
// esta última restringida a administradores o al propio dueño del perfil.

/** GET /me/registrations - Lista las inscripciones a eventos del usuario autenticado. */
router.get('/me/registrations', authenticate, registrationController.getMyRegistrations);
/** GET /me/favorites - Lista los eventos favoritos del usuario autenticado. */
router.get('/me/favorites', authenticate, favoriteController.getMyFavorites);
/** POST /me/avatar - Sube/actualiza la foto de perfil del usuario autenticado. */
router.post('/me/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);

/**
 * Middleware de autorización: permite continuar solo si el usuario autenticado es administrador
 * o si está accediendo/modificando su propio perfil (comparando su id con el parámetro :id de la ruta).
 */
function ownProfileOrAdmin(req, res, next) {
  if (req.user.role === 'administrador' || req.user.id.toString() === req.params.id) {
    return next();
  }
  return next(require('../utils/ApiError').forbidden('No tiene permisos para realizar esta acción'));
}

/** GET / - Lista todos los usuarios (solo administrador). */
router.get('/', authenticate, authorize('administrador'), userController.getUsers);
/** GET /:id - Obtiene el perfil de un usuario (propio o administrador). */
router.get('/:id', authenticate, ownProfileOrAdmin, userController.getUser);
/** PUT /:id - Actualiza el perfil de un usuario (propio o administrador). */
router.put('/:id', authenticate, ownProfileOrAdmin, userController.updateUser);
/** DELETE /:id - Elimina un usuario (solo administrador). */
router.delete('/:id', authenticate, authorize('administrador'), userController.deleteUser);

module.exports = router;