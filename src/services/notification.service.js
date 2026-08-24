const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

/**
 * Obtiene todas las notificaciones de un usuario, ordenadas de más reciente a más antigua.
 * @param {string} userId - Identificador del usuario.
 * @returns {Promise<Array<Object>>} Lista de notificaciones del usuario.
 */
async function getUserNotifications(userId) {
  return Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('event', 'title date location');
}

/**
 * Marca una notificación como leída (o no leída) para un usuario específico.
 * @param {string} notificationId - Identificador de la notificación.
 * @param {string} userId - Identificador del usuario dueño de la notificación.
 * @param {boolean} [explicitRead] - Valor explícito de "leído"; si no se proporciona, se marca como leída (true).
 * @returns {Promise<Object>} Notificación actualizada.
 */
async function markAsRead(notificationId, userId, explicitRead) {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw ApiError.notFound('Notificación no encontrada');
  }

  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) {
    throw ApiError.notFound('Notificación no encontrada');
  }

  notification.read = explicitRead !== undefined ? Boolean(explicitRead) : true;
  await notification.save();
  await notification.populate('event', 'title date location');
  return notification;
}

/**
 * Marca todas las notificaciones de un usuario como leídas.
 * @param {string} userId - Identificador del usuario.
 * @returns {Promise<void>}
 */
async function markAllAsRead(userId) {
  await Notification.updateMany({ user: userId }, { $set: { read: true } });
}

// Exporta las funciones del servicio de notificaciones.
module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
