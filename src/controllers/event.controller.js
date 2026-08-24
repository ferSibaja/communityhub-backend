const ApiError = require('../utils/ApiError');
const eventService = require('../services/event.service');

// Campos obligatorios que debe incluir el body al crear una actividad/evento
const REQUIRED_FIELDS = ['title', 'description', 'category', 'date', 'time', 'location', 'capacity'];
// Campos permitidos para actualizar una actividad/evento existente
const UPDATABLE_FIELDS = [
    'title',
    'description',
    'category',
    'date',
    'time',
    'location',
    'capacity',
    'image',
    'status',
];

/**
 * Controlador que lista actividades/eventos, aplicando filtros y paginación
 * según los parámetros de consulta (query string).
 * Maneja GET /api/events.
 * @param {import('express').Request} req - Solicitud HTTP con filtros/paginación en req.query.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function list(req, res, next) {
    try {
        const { events, pagination } = await eventService.listEvents(req.query);
        res.status(200).json({ success: true, data: events, pagination });
    } catch (error) {
        next(error);
    }
}

/**
 * Controlador que obtiene una actividad/evento específico por su id.
 * Maneja GET /api/events/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el id del evento en req.params.id.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function getById(req, res, next) {
    try {
        const event = await eventService.getEventById(req.params.id);
        res.status(200).json({ success: true, data: { event } });
    } catch (error) {
        next(error);
    }
}

/**
 * Controlador que crea una nueva actividad/evento.
 * Valida que estén presentes los campos obligatorios (REQUIRED_FIELDS)
 * antes de delegar la creación al servicio.
 * Maneja POST /api/events.
 * @param {import('express').Request} req - Solicitud HTTP con los datos del evento en el body y el usuario autenticado en req.user.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function create(req, res, next) {
    try {
        // Campos obligatorios que faltan en la petición
        const missing = REQUIRED_FIELDS.filter((field) => !req.body[field]);
        if (missing.length > 0) {
            throw ApiError.badRequest(`Faltan campos obligatorios: ${missing.join(', ')}`);
        }

        // Payload final con solo los campos permitidos para creación
        const payload = {};
        for (const field of REQUIRED_FIELDS) {
            payload[field] = req.body[field];
        }
        if (req.body.image !== undefined) {
            payload.image = req.body.image;
        }

        const event = await eventService.createEvent(req.user.id, payload);

        res.status(201).json({
            success: true,
            message: 'Actividad creada correctamente',
            data: { event },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Controlador que actualiza una actividad/evento existente.
 * Solo toma en cuenta los campos permitidos definidos en UPDATABLE_FIELDS
 * que estén presentes en el body de la petición.
 * Maneja PUT/PATCH /api/events/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el id en req.params.id, los datos a actualizar en el body y el usuario autenticado en req.user.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function update(req, res, next) {
    try {
        // Payload con solo los campos actualizables presentes en el body
        const payload = {};
        for (const field of UPDATABLE_FIELDS) {
            if (req.body[field] !== undefined) {
                payload[field] = req.body[field];
            }
        }

        const event = await eventService.updateEvent(req.params.id, req.user, payload);

        res.status(200).json({
            success: true,
            message: 'Actividad actualizada correctamente',
            data: { event },
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Controlador que elimina una actividad/evento existente.
 * Maneja DELETE /api/events/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el id en req.params.id y el usuario autenticado en req.user.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function remove(req, res, next) {
    try {
        await eventService.deleteEvent(req.params.id, req.user);
        res.status(200).json({ success: true, message: 'Actividad eliminada correctamente' });
    } catch (error) {
        next(error);
    }
}

// Exporta los controladores de actividades/eventos para usarlos en las rutas
module.exports = { list, getById, create, update, remove };