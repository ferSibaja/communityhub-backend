const mongoose = require('mongoose');

/**
 * Esquema de Favorito.
 * Representa la relación entre un usuario y un evento que ha marcado como favorito.
 */
const favoriteSchema = new mongoose.Schema(
  {
    /** Referencia al usuario (User) que marcó el favorito. */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Referencia al evento (Event) marcado como favorito. */
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
  },
  { timestamps: true } // Agrega automáticamente createdAt y updatedAt
);

// Índice único compuesto: evita que un mismo usuario marque el mismo evento como favorito más de una vez
favoriteSchema.index({ user: 1, event: 1 }, { unique: true });

// Exporta el modelo 'Favorite' basado en el esquema definido arriba
module.exports = mongoose.model('Favorite', favoriteSchema);