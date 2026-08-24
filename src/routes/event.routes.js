const express = require('express');
const eventController = require('../controllers/event.controller');
const registrationController = require('../controllers/registration.controller');
const favoriteController = require('../controllers/favorite.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas de eventos: listado/consulta pública, inscripción, favoritos y administración
// (creación/edición/eliminación) restringida a organizadores y administradores.

/** GET / - Lista los eventos disponibles. */
router.get('/', eventController.list);
/** GET /:id - Obtiene el detalle de un evento por su id. */
router.get('/:id', eventController.getById);

/** POST /:id/register - Inscribe al usuario autenticado en el evento. */
router.post('/:id/register', authenticate, registrationController.registerToEvent);
/** DELETE /:id/register - Cancela la inscripción del usuario autenticado en el evento. */
router.delete('/:id/register', authenticate, registrationController.cancelRegistration);
/** GET /:id/register/status - Consulta si el usuario autenticado está inscrito en el evento. */
router.get('/:id/register/status', authenticate, registrationController.checkStatus);

/** POST /:id/favorite - Marca el evento como favorito para el usuario autenticado. */
router.post('/:id/favorite', authenticate, favoriteController.addFavorite);
/** DELETE /:id/favorite - Quita el evento de los favoritos del usuario autenticado. */
router.delete('/:id/favorite', authenticate, favoriteController.removeFavorite);
/** GET /:id/favorite/status - Consulta si el evento es favorito del usuario autenticado. */
router.get('/:id/favorite/status', authenticate, favoriteController.checkStatus);

/** GET /:id/participants - Lista los participantes inscritos en el evento (organizador/administrador). */
router.get('/:id/participants', authenticate, authorize('organizador', 'administrador'), registrationController.getParticipants);
/** POST / - Crea un nuevo evento (organizador/administrador). */
router.post('/', authenticate, authorize('organizador', 'administrador'), eventController.create);
/** PUT /:id - Actualiza un evento existente (organizador/administrador). */
router.put('/:id', authenticate, authorize('organizador', 'administrador'), eventController.update);
/** DELETE /:id - Elimina un evento (organizador/administrador). */
router.delete('/:id', authenticate, authorize('organizador', 'administrador'), eventController.remove);

module.exports = router;