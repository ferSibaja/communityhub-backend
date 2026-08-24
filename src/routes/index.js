const express = require('express');
const authRoutes = require('./auth.routes');
const eventRoutes = require('./event.routes');
const categoryRoutes = require('./category.routes');
const userRoutes = require('./user.routes');
const dashboardRoutes = require('./dashboard.routes');
const notificationRoutes = require('./notification.routes');

const router = express.Router();

// Router principal: agrupa y monta todos los sub-routers de la API bajo sus respectivos prefijos.

/** Monta las rutas de autenticación bajo /auth. */
router.use('/auth', authRoutes);
/** Monta las rutas de eventos bajo /events. */
router.use('/events', eventRoutes);
/** Monta las rutas de categorías bajo /categories. */
router.use('/categories', categoryRoutes);
/** Monta las rutas de usuarios bajo /users. */
router.use('/users', userRoutes);
/** Monta las rutas del dashboard bajo /dashboard. */
router.use('/dashboard', dashboardRoutes);
/** Monta las rutas de notificaciones bajo /notifications. */
router.use('/notifications', notificationRoutes);

module.exports = router;