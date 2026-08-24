const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas del panel (dashboard): estadísticas y datos resumidos para el usuario autenticado.

/** GET / - Obtiene los datos del dashboard del usuario autenticado. */
router.get('/', authenticate, dashboardController.getDashboardData);

module.exports = router;