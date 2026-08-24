const categoryService = require('../services/category.service');

/**
 * Controlador que lista todas las categorías disponibles.
 * Maneja GET /api/categories.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que obtiene una categoría específica por su id.
 * Maneja GET /api/categories/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el id de la categoría en req.params.id.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function getCategory(req, res, next) {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que crea una nueva categoría.
 * Maneja POST /api/categories.
 * @param {import('express').Request} req - Solicitud HTTP con los datos de la categoría en el body.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function createCategory(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que actualiza una categoría existente.
 * Maneja PUT/PATCH /api/categories/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el id en req.params.id y los datos a actualizar en el body.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function updateCategory(req, res, next) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que elimina una categoría existente.
 * Maneja DELETE /api/categories/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el id de la categoría en req.params.id.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function deleteCategory(req, res, next) {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente',
    });
  } catch (error) {
    next(error);
  }
}

// Exporta los controladores de categorías para usarlos en las rutas
module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};