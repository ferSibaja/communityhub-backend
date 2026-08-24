const mongoose = require('mongoose');

/**
 * Esquema de Categoría.
 * Representa una categoría bajo la cual se agrupan los eventos (por ejemplo: Deportes, Cultura, etc.).
 */
const categorySchema = new mongoose.Schema(
  {
    /** Nombre único de la categoría. */
    name: {
      type: String,
      required: [true, 'El nombre de la categoría es obligatorio'],
      unique: true,
      trim: true,
    },
    /** Descripción opcional de la categoría. */
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true } // Agrega automáticamente createdAt y updatedAt
);

// Exporta el modelo 'Category' basado en el esquema definido arriba
module.exports = mongoose.model('Category', categorySchema);