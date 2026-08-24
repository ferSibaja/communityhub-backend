const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');

/**
 * Obtiene todas las categorías ordenadas alfabéticamente por nombre.
 * @returns {Promise<Array<Object>>} Lista de categorías.
 */
async function getAllCategories() {
  return Category.find().sort({ name: 1 });
}

/**
 * Busca una categoría por su identificador.
 * @param {string} id - Identificador de la categoría.
 * @returns {Promise<Object>} Documento de la categoría encontrada.
 */
async function getCategoryById(id) {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Categoría no encontrada');
  }
  return category;
}

/**
 * Crea una nueva categoría, validando que el nombre sea válido y único.
 * @param {Object} payload - Datos de la categoría a crear (debe incluir "name").
 * @returns {Promise<Object>} Categoría creada.
 */
async function createCategory(payload) {
  if (!payload.name || !payload.name.trim()) {
    throw ApiError.badRequest('El nombre de la categoría es obligatorio');
  }

  const existing = await Category.findOne({ name: payload.name.trim() });
  if (existing) {
    throw ApiError.conflict('Ya existe una categoría con este nombre');
  }

  return Category.create(payload);
}

/**
 * Actualiza una categoría existente validando nombre no vacío y no duplicado.
 * @param {string} id - Identificador de la categoría a actualizar.
 * @param {Object} payload - Campos a actualizar en la categoría.
 * @returns {Promise<Object>} Categoría actualizada.
 */
async function updateCategory(id, payload) {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Categoría no encontrada');
  }

  if (payload.name !== undefined && !payload.name.trim()) {
    throw ApiError.badRequest('El nombre de la categoría no puede estar vacío');
  }

  if (payload.name && payload.name.trim() !== category.name) {
    const existing = await Category.findOne({ name: payload.name.trim() });
    if (existing) {
      throw ApiError.conflict('Ya existe una categoría con este nombre');
    }
  }

  Object.assign(category, payload);
  await category.save();
  return category;
}

/**
 * Elimina una categoría existente por su identificador.
 * @param {string} id - Identificador de la categoría a eliminar.
 * @returns {Promise<void>}
 */
async function deleteCategory(id) {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Categoría no encontrada');
  }

  await category.deleteOne();
}

// Exporta las funciones del servicio de categorías.
module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
