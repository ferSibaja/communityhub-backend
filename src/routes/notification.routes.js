const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas de notificaciones del usuario autenticado. Se exponen múltiples alias de método/ruta
// (read-all, mark-all-read, readall / :id/read, :id) para mantener compatibilidad con distintos clientes.

/** GET / - Lista las notificaciones del usuario autenticado. */
router.get('/', authenticate, notificationController.getNotifications);

// Alias equivalentes para marcar todas las notificaciones como leídas.
router.patch('/read-all', authenticate, notificationController.markAllRead);
router.put('/read-all', authenticate, notificationController.markAllRead);
router.post('/read-all', authenticate, notificationController.markAllRead);
router.patch('/mark-all-read', authenticate, notificationController.markAllRead);
router.put('/mark-all-read', authenticate, notificationController.markAllRead);
router.post('/mark-all-read', authenticate, notificationController.markAllRead);
router.patch('/readall', authenticate, notificationController.markAllRead);
router.put('/readall', authenticate, notificationController.markAllRead);
router.post('/readall', authenticate, notificationController.markAllRead);

// Alias equivalentes para marcar una notificación específica como leída.
router.patch('/:id/read', authenticate, notificationController.markRead);
router.put('/:id/read', authenticate, notificationController.markRead);
router.post('/:id/read', authenticate, notificationController.markRead);
router.patch('/:id', authenticate, notificationController.markRead);
router.put('/:id', authenticate, notificationController.markRead);
router.post('/:id', authenticate, notificationController.markRead);

module.exports = router;