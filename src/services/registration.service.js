const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

/**
 * Inscribe a un usuario en una actividad, validando estado, fecha, duplicidad y cupos disponibles.
 * Crea una notificación de confirmación al finalizar.
 * @param {string} userId - Identificador del usuario que se inscribe.
 * @param {string} eventId - Identificador de la actividad.
 * @returns {Promise<Object>} Documento de inscripción creado o reactivado.
 */
async function registerToEvent(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  if (event.status !== 'active') {
    throw ApiError.badRequest('No es posible inscribirse a una actividad cancelada o finalizada');
  }

  if (new Date(event.date) < new Date()) {
    throw ApiError.badRequest('No puedes inscribirte a una actividad que ya ha transcurrido');
  }

  // Inscripción previa del usuario en esta actividad (puede estar cancelada).
  const existingRegistration = await Registration.findOne({
    user: userId,
    event: eventId,
  });

  if (existingRegistration && existingRegistration.status === 'confirmed') {
    throw ApiError.conflict('Ya te encuentras inscrito en esta actividad');
  }

  const registeredCount = await Registration.countDocuments({
    event: eventId,
    status: 'confirmed',
  });

  if (registeredCount >= event.capacity) {
    throw ApiError.badRequest('La actividad no tiene cupos disponibles');
  }

  let registration;
  if (existingRegistration) {
    // Reactiva una inscripción previamente cancelada en lugar de crear una nueva.
    existingRegistration.status = 'confirmed';
    await existingRegistration.save();
    registration = existingRegistration;
  } else {
    registration = await Registration.create({
      user: userId,
      event: eventId,
      status: 'confirmed',
    });
  }

  await Notification.create({
    user: userId,
    event: eventId,
    type: 'registration',
    message: `Te inscribiste correctamente en "${event.title}".`,
  });

  return registration;
}

/**
 * Cancela la inscripción confirmada de un usuario en una actividad y genera una notificación.
 * @param {string} userId - Identificador del usuario.
 * @param {string} eventId - Identificador de la actividad.
 * @returns {Promise<void>}
 */
async function cancelRegistration(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  const registration = await Registration.findOne({
    user: userId,
    event: eventId,
    status: 'confirmed',
  });

  if (!registration) {
    throw ApiError.notFound('No tienes una inscripción activa para esta actividad');
  }

  registration.status = 'cancelled';
  await registration.save();

  const event = await Event.findById(eventId);
  await Notification.create({
    user: userId,
    event: eventId,
    type: 'cancellation_user',
    message: `Cancelaste tu inscripción en "${event ? event.title : 'la actividad'}".`,
  });
}

/**
 * Obtiene las inscripciones de un usuario, opcionalmente filtradas por estado.
 * @param {string} userId - Identificador del usuario.
 * @param {string} [statusFilter] - Estado a filtrar ("confirmed" o "cancelled"); si es inválido, se ignora.
 * @returns {Promise<Array<Object>>} Lista de inscripciones del usuario.
 */
async function getUserRegistrations(userId, statusFilter) {
  const query = { user: userId };
  if (statusFilter && ['confirmed', 'cancelled'].includes(statusFilter)) {
    query.status = statusFilter;
  }

  const registrations = await Registration.find(query)
    .sort({ createdAt: -1 })
    .populate({
      path: 'event',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'organizer', select: 'firstName lastName email' },
      ],
    });

  return registrations;
}

/**
 * Indica si un usuario tiene una inscripción confirmada en una actividad.
 * @param {string} userId - Identificador del usuario.
 * @param {string} eventId - Identificador de la actividad.
 * @returns {Promise<boolean>} true si el usuario está inscrito y confirmado, false en caso contrario.
 */
async function getRegistrationStatus(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return false;
  }
  const registration = await Registration.findOne({
    user: userId,
    event: eventId,
    status: 'confirmed',
  });
  return Boolean(registration);
}

/**
 * Obtiene la lista de participantes confirmados de una actividad.
 * Solo el organizador de la actividad o un administrador pueden consultarla.
 * @param {string} eventId - Identificador de la actividad.
 * @param {Object} requester - Usuario que realiza la solicitud (debe tener id y role).
 * @returns {Promise<Object>} Información de la actividad, total de participantes y lista de participantes.
 */
async function getEventParticipants(eventId, requester) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  const isOwner = event.organizer.toString() === requester.id.toString();
  const isAdmin = requester.role === 'administrador';
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('Solo el organizador de este evento o un administrador pueden ver la lista de participantes');
  }

  const registrations = await Registration.find({
    event: eventId,
    status: 'confirmed',
  })
    .sort({ createdAt: -1 })
    .populate('user', 'firstName lastName email profilePicture');

  return {
    event: {
      id: event._id,
      title: event.title,
      capacity: event.capacity,
      spotsAvailable: Math.max(event.capacity - registrations.length, 0),
    },
    totalParticipants: registrations.length,
    participants: registrations.map((r) => ({
      registrationId: r._id,
      user: r.user,
      registeredAt: r.createdAt,
    })),
  };
}

// Exporta las funciones del servicio de inscripciones.
module.exports = {
  registerToEvent,
  cancelRegistration,
  getUserRegistrations,
  getRegistrationStatus,
  getEventParticipants,
};
