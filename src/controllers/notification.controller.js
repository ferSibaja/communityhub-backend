const notificationService = require('../services/notification.service');

/**
 * Controlador que obtiene todas las notificaciones del usuario autenticado.
 * Maneja GET /api/notifications.
 * @param {import('express').Request} req - Solicitud HTTP con el usuario autenticado en req.user.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function getNotifications(req, res, next) {
  try {
    // Notificaciones obtenidas del servicio (posiblemente documentos de Mongoose)
    const raw = await notificationService.getUserNotifications(req.user.id);
    // Notificaciones convertidas a objetos planos (JSON) para la respuesta
    const notifications = raw.map((n) => (n.toJSON ? n.toJSON() : n));
    res.json({
      success: true,
      data: { notifications },
      notifications,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que marca una notificación como leída (o no leída, según el body).
 * Maneja PATCH /api/notifications/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el id de la notificación en req.params.id, el usuario autenticado en req.user y opcionalmente `read`/`isRead` en el body.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function markRead(req, res, next) {
  try {
    // Valor explícito de lectura recibido en el body (read o isRead), por defecto true
    const explicitRead =
      req.body && req.body.read !== undefined
        ? req.body.read
        : req.body && req.body.isRead !== undefined
        ? req.body.isRead
        : true;

    const raw = await notificationService.markAsRead(req.params.id, req.user.id, explicitRead);
    // Notificación actualizada, convertida a objeto plano (JSON) para la respuesta
    const notification = raw.toJSON ? raw.toJSON() : raw;

    res.json({
      success: true,
      message: 'Notificación actualizada correctamente',
      data: { notification },
      notification,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que marca todas las notificaciones del usuario autenticado como leídas.
 * Maneja PATCH /api/notifications/read-all.
 * @param {import('express').Request} req - Solicitud HTTP con el usuario autenticado en req.user.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({
      success: true,
      message: 'Todas las notificaciones fueron marcadas como leídas',
    });
  } catch (error) {
    next(error);
  }
}

// Exporta los controladores de notificaciones para usarlos en las rutas
module.exports = {
  getNotifications,
  markRead,
  markAllRead,
};