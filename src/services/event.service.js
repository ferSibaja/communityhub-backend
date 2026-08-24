const mongoose = require('mongoose');
const Event = require('../models/Event');
const Category = require('../models/Category');
const Registration = require('../models/Registration');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

// Cantidad de actividades por página cuando no se especifica un límite.
const DEFAULT_LIMIT = 12;
// Límite máximo de actividades permitidas por página.
const MAX_LIMIT = 50;

/**
 * Añade a cada actividad la cantidad de inscritos confirmados y los cupos disponibles.
 * @param {Array<Object>} events - Lista de documentos (o instancias) de actividades.
 * @returns {Promise<Array<Object>>} Lista de actividades enriquecidas con "registeredCount" y "spotsAvailable".
 */
async function attachAvailability(events) {
    return Promise.all(
        events.map(async (event) => {
            const registeredCount = await Registration.countDocuments({
                event: event._id,
                status: 'confirmed',
            });
            const plain = event.toObject ? event.toObject() : event;
            return {
                ...plain,
                registeredCount,
                spotsAvailable: Math.max(plain.capacity - registeredCount, 0),
            };
        })
    );
}

/**
 * Verifica que quien solicita modificar una actividad sea su organizador o un administrador.
 * @param {Object} event - Documento de la actividad.
 * @param {Object} requester - Usuario que realiza la solicitud (debe tener id y role).
 * @returns {void}
 */
function ensureOwnership(event, requester) {
    const isOwner = event.organizer.toString() === requester.id.toString();
    const isAdmin = requester.role === 'administrador';
    if (!isOwner && !isAdmin) {
        throw ApiError.forbidden('No puedes modificar una actividad que no organizas');
    }
}

/**
 * Verifica que exista una categoría con el id proporcionado.
 * @param {string} categoryId - Identificador de la categoría a validar.
 * @returns {Promise<void>}
 */
async function assertCategoryExists(categoryId) {
    const category = await Category.findById(categoryId).catch(() => null);
    if (!category) {
        throw ApiError.badRequest('La categoría seleccionada no existe');
    }
}

/**
 * Lista actividades aplicando filtros de búsqueda, categoría, fecha, ubicación,
 * organizador, disponibilidad de cupos y estado, además de paginación.
 * @param {Object} query - Parámetros de consulta (search, category, date, location, organizer, available, status, page, limit).
 * @returns {Promise<{events: Array<Object>, pagination: Object}>} Actividades paginadas y metadatos de paginación.
 */
async function listEvents(query) {
    const {
        search,
        category,
        date,
        location,
        organizer,
        available,
        status,
        page = 1,
        limit = DEFAULT_LIMIT,
    } = query;

    // Objeto de filtro de Mongo construido dinámicamente según los parámetros recibidos.
    const filter = {};

    if (search) {
        filter.title = { $regex: search, $options: 'i' };
    }

    if (category) {
        filter.category = category;
    }

    if (location) {
        filter.location = { $regex: location, $options: 'i' };
    }

    if (organizer) {
        filter.organizer = organizer;
    }

    if (date) {
        const start = new Date(date);
        if (Number.isNaN(start.getTime())) {
            throw ApiError.badRequest('La fecha proporcionada no es válida');
        }
        // Rango de un día completo [start, end) para filtrar por fecha exacta.
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        filter.date = { $gte: start, $lt: end };
    }

    if (status) {
        filter.status = status;
    } else if (!organizer) {
        filter.status = 'active';
    }

    const events = await Event.find(filter)
        .sort({ date: 1 })
        .populate('category', 'name')
        .populate('organizer', 'firstName lastName');

    let withAvailability = await attachAvailability(events);

    if (available === 'true') {
        withAvailability = withAvailability.filter((event) => event.spotsAvailable > 0);
    }

    // Cálculo de paginación, acotando página y límite a valores válidos.
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const total = withAvailability.length;
    const start = (pageNum - 1) * limitNum;
    const paginated = withAvailability.slice(start, start + limitNum);

    return {
        events: paginated,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
        },
    };
}

/**
 * Obtiene una actividad por su identificador, incluyendo categoría, organizador y disponibilidad.
 * @param {string} id - Identificador de la actividad.
 * @returns {Promise<Object>} Actividad encontrada con disponibilidad calculada.
 */
async function getEventById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw ApiError.notFound('Actividad no encontrada');
    }

    const event = await Event.findById(id)
        .populate('category', 'name')
        .populate('organizer', 'firstName lastName email');

    if (!event) {
        throw ApiError.notFound('Actividad no encontrada');
    }

    const [withAvailability] = await attachAvailability([event]);
    return withAvailability;
}

/**
 * Crea una nueva actividad asociada a un organizador, validando previamente su categoría.
 * @param {string} organizerId - Identificador del usuario organizador.
 * @param {Object} payload - Datos de la actividad a crear.
 * @returns {Promise<Object>} Actividad creada, con disponibilidad calculada.
 */
async function createEvent(organizerId, payload) {
    await assertCategoryExists(payload.category);

    const event = await Event.create({
        ...payload,
        organizer: organizerId,
    });

    return getEventById(event._id);
}

/**
 * Actualiza una actividad existente. Si el estado cambia de activa a cancelada,
 * notifica a todos los usuarios con inscripción confirmada.
 * @param {string} id - Identificador de la actividad a actualizar.
 * @param {Object} requester - Usuario que realiza la solicitud (debe tener id y role).
 * @param {Object} payload - Campos a actualizar en la actividad.
 * @returns {Promise<Object>} Actividad actualizada, con disponibilidad calculada.
 */
async function updateEvent(id, requester, payload) {
    const event = await Event.findById(id);
    if (!event) {
        throw ApiError.notFound('Actividad no encontrada');
    }

    ensureOwnership(event, requester);

    if (payload.category) {
        await assertCategoryExists(payload.category);
    }

    // Estado previo, usado para detectar la transición activa -> cancelada.
    const wasActive = event.status === 'active';
    Object.assign(event, payload);
    await event.save();

    if (wasActive && event.status === 'cancelled') {
        const registrations = await Registration.find({ event: event._id, status: 'confirmed' });
        await Promise.all(
            registrations.map((registration) =>
                Notification.create({
                    user: registration.user,
                    event: event._id,
                    type: 'cancellation',
                    message: `La actividad "${event.title}" fue cancelada por el organizador.`,
                })
            )
        );
    }

    return getEventById(event._id);
}

/**
 * Elimina una actividad y todos sus registros relacionados (inscripciones y favoritos).
 * @param {string} id - Identificador de la actividad a eliminar.
 * @param {Object} requester - Usuario que realiza la solicitud (debe tener id y role).
 * @returns {Promise<void>}
 */
async function deleteEvent(id, requester) {
    const event = await Event.findById(id);
    if (!event) {
        throw ApiError.notFound('Actividad no encontrada');
    }

    ensureOwnership(event, requester);

    await Promise.all([
        Registration.deleteMany({ event: event._id }),
        Favorite.deleteMany({ event: event._id }),
        event.deleteOne(),
    ]);
}

// Exporta las funciones del servicio de actividades.
module.exports = { listEvents, getEventById, createEvent, updateEvent, deleteEvent };
