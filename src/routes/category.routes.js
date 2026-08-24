const express = require('express');
const categoryController = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Rutas de categorías: consulta pública y administración (creación/edición/eliminación) restringida a administradores.

/** GET / - Lista todas las categorías disponibles. */
router.get('/', categoryController.getCategories);
/** GET /:id - Obtiene el detalle de una categoría por su id. */
router.get('/:id', categoryController.getCategory);

/** POST / - Crea una nueva categoría (solo administrador). */
router.post('/', authenticate, authorize('administrador'), categoryController.createCategory);
/** PUT /:id - Actualiza una categoría existente (solo administrador). */
router.put('/:id', authenticate, authorize('administrador'), categoryController.updateCategory);
/** DELETE /:id - Elimina una categoría (solo administrador). */
router.delete('/:id', authenticate, authorize('administrador'), categoryController.deleteCategory);

module.exports = router;