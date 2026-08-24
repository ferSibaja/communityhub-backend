const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Event = require('../models/Event');
const ApiError = require('../utils/ApiError');

/**
 * Agrega una actividad a los favoritos de un usuario. Si ya existe, devuelve el favorito existente.
 * @param {string} userId - Identificador del usuario.
 * @param {string} eventId - Identificador de la actividad a marcar como favorita.
 * @returns {Promise<Object>} Documento de favorito creado o existente.
 */
async function addFavorite(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  const existing = await Favorite.findOne({ user: userId, event: eventId });
  if (existing) {
    return existing;
  }

  return Favorite.create({ user: userId, event: eventId });
}

/**
 * Elimina una actividad de los favoritos de un usuario.
 * @param {string} userId - Identificador del usuario.
 * @param {string} eventId - Identificador de la actividad a quitar de favoritos.
 * @returns {Promise<void>}
 */
async function removeFavorite(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  await Favorite.deleteOne({ user: userId, event: eventId });
}

/**
 * Obtiene todas las actividades favoritas de un usuario, con categoría y organizador poblados.
 * @param {string} userId - Identificador del usuario.
 * @returns {Promise<Array<Object>>} Lista de favoritos del usuario.
 */
async function getUserFavorites(userId) {
  const favorites = await Favorite.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'event',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'organizer', select: 'firstName lastName email' },
      ],
    });

  return favorites;
}

/**
 * Verifica si una actividad es favorita de un usuario.
 * @param {string} userId - Identificador del usuario.
 * @param {string} eventId - Identificador de la actividad.
 * @returns {Promise<boolean>} true si la actividad está marcada como favorita, false en caso contrario.
 */
async function isFavorite(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return false;
  }
  const fav = await Favorite.findOne({ user: userId, event: eventId });
  return Boolean(fav);
}

// Exporta las funciones del servicio de favoritos.
module.exports = {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  isFavorite,
};
