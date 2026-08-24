const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');
const Category = require('../models/Category');

/**
 * Genera los datos del panel (dashboard) para un usuario regular:
 * inscripciones confirmadas, próximas actividades, favoritos y notificaciones no leídas.
 * @param {string} userId - Identificador del usuario.
 * @returns {Promise<Object>} Resumen del dashboard del usuario.
 */
async function getUserDashboard(userId) {
  const [registrations, favoritesCount, unreadNotificationsCount] = await Promise.all([
    Registration.find({ user: userId, status: 'confirmed' })
      .populate({
        path: 'event',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'organizer', select: 'firstName lastName' },
        ],
      })
      .sort({ createdAt: -1 }),
    Favorite.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, read: false }),
  ]);

  // Fecha actual usada para filtrar las inscripciones a actividades futuras.
  const now = new Date();
  const upcomingRegistrations = registrations.filter(
    (r) => r.event && new Date(r.event.date) >= now
  );

  return {
    registrationsCount: registrations.length,
    upcomingCount: upcomingRegistrations.length,
    favoritesCount,
    unreadNotificationsCount,
    upcomingEvents: upcomingRegistrations.slice(0, 5).map((r) => r.event),
  };
}

/**
 * Genera los datos del panel (dashboard) para un organizador:
 * total de actividades, actividades activas/canceladas y participantes totales.
 * @param {string} organizerId - Identificador del organizador.
 * @returns {Promise<Object>} Resumen del dashboard del organizador.
 */
async function getOrganizerDashboard(organizerId) {
  const events = await Event.find({ organizer: organizerId }).sort({ date: 1 });
  // Ids de las actividades del organizador, usados para contar inscripciones.
  const eventIds = events.map((e) => e._id);

  const [totalRegistrations, activeCount, cancelledCount] = await Promise.all([
    Registration.countDocuments({ event: { $in: eventIds }, status: 'confirmed' }),
    Event.countDocuments({ organizer: organizerId, status: 'active' }),
    Event.countDocuments({ organizer: organizerId, status: 'cancelled' }),
  ]);

  return {
    totalEvents: events.length,
    activeEventsCount: activeCount,
    cancelledEventsCount: cancelledCount,
    totalParticipants: totalRegistrations,
    recentEvents: events.slice(0, 5),
  };
}

/**
 * Genera los datos del panel (dashboard) para un administrador:
 * estadísticas globales de usuarios, organizadores, actividades, inscripciones y categorías.
 * @returns {Promise<Object>} Resumen del dashboard administrativo.
 */
async function getAdminDashboard() {
  const [
    totalUsers,
    totalOrganizers,
    totalEvents,
    activeEvents,
    finishedEvents,
    totalRegistrations,
    totalCategories,
  ] = await Promise.all([
    User.countDocuments({ role: 'usuario' }),
    User.countDocuments({ role: 'organizador' }),
    Event.countDocuments({}),
    Event.countDocuments({ status: 'active' }),
    Event.countDocuments({ status: 'finished' }),
    Registration.countDocuments({ status: 'confirmed' }),
    Category.countDocuments({}),
  ]);

  return {
    totalUsers,
    totalOrganizers,
    totalEvents,
    activeEvents,
    finishedEvents,
    totalRegistrations,
    totalCategories,
  };
}

// Exporta las funciones del servicio de dashboards por rol.
module.exports = {
  getUserDashboard,
  getOrganizerDashboard,
  getAdminDashboard,
};
