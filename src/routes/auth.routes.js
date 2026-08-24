const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas de autenticación: registro, inicio/cierre de sesión y datos del usuario actual.

/** POST /register - Registra un nuevo usuario en la plataforma. */
router.post('/register', authController.register);
/** POST /login - Inicia sesión y devuelve el token de autenticación. */
router.post('/login', authController.login);
/** GET /me - Devuelve los datos del usuario autenticado actualmente. */
router.get('/me', authenticate, authController.me);
/** POST /logout - Cierra la sesión del usuario autenticado. */
router.post('/logout', authenticate, authController.logout);

module.exports = router;