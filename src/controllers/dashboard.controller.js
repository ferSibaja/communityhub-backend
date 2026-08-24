const dashboardService = require('../services/dashboard.service');

/**
 * Controlador que obtiene los datos del panel (dashboard) según el rol
 * del usuario autenticado (administrador, organizador o usuario regular).
 * Maneja GET /api/dashboard.
 * @param {import('express').Request} req - Solicitud HTTP con el usuario autenticado en req.user.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function getDashboardData(req, res, next) {
  try {
    // Rol del usuario autenticado, determina qué métricas se calculan
    const role = req.user.role;
    let data = {};

    if (role === 'administrador') {
      data = await dashboardService.getAdminDashboard();
    } else if (role === 'organizador') {
      data = await dashboardService.getOrganizerDashboard(req.user.id);
    } else {
      data = await dashboardService.getUserDashboard(req.user.id);
    }

    res.json({
      success: true,
      data: {
        role,
        metrics: data,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Exporta el controlador del dashboard para usarlo en las rutas
module.exports = {
  getDashboardData,
};