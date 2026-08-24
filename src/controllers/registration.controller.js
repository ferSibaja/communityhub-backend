const registrationService = require('../services/registration.service');

/**
 * Controlador que inscribe al usuario autenticado en una actividad/evento.
 * Maneja POST /api/registrations/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el usuario autenticado en req.user y el id de la actividad en req.params.id.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function registerToEvent(req, res, next) {
  try {
    const registration = await registrationService.registerToEvent(
      req.user.id,
      req.params.id
    );
    res.status(201).json({
      success: true,
      message: 'Te has inscrito exitosamente a la actividad',
      data: { registration },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que cancela la inscripción del usuario autenticado a una actividad/evento.
 * Maneja DELETE /api/registrations/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el usuario autenticado en req.user y el id de la actividad en req.params.id.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function cancelRegistration(req, res, next) {
  try {
    await registrationService.cancelRegistration(
      req.user.id,
      req.params.id
    );
    res.json({
      success: true,
      message: 'Tu inscripción ha sido cancelada exitosamente',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que obtiene las inscripciones del usuario autenticado,
 * opcionalmente filtradas por estado.
 * Maneja GET /api/registrations/mine.
 * @param {import('express').Request} req - Solicitud HTTP con el usuario autenticado en req.user y un filtro opcional `status` en req.query.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function getMyRegistrations(req, res, next) {
  try {
    const registrations = await registrationService.getUserRegistrations(
      req.user.id,
      req.query.status
    );
    res.json({
      success: true,
      data: { registrations },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que verifica si el usuario autenticado está inscrito en una actividad/evento.
 * Maneja GET /api/registrations/:id/status.
 * @param {import('express').Request} req - Solicitud HTTP con el usuario autenticado en req.user y el id de la actividad en req.params.id.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function checkStatus(req, res, next) {
  try {
    const isRegistered = await registrationService.getRegistrationStatus(
      req.user.id,
      req.params.id
    );
    res.json({
      success: true,
      data: { isRegistered },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que obtiene la lista de participantes inscritos en una actividad/evento.
 * Maneja GET /api/registrations/:id/participants.
 * @param {import('express').Request} req - Solicitud HTTP con el id de la actividad en req.params.id y el usuario autenticado en req.user.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function getParticipants(req, res, next) {
  try {
    const data = await registrationService.getEventParticipants(
      req.params.id,
      req.user
    );
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

// Exporta los controladores de inscripciones para usarlos en las rutas
module.exports = {
  registerToEvent,
  cancelRegistration,
  getMyRegistrations,
  checkStatus,
  getParticipants,
};