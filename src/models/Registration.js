const mongoose = require('mongoose');

/**
 * Esquema de Inscripción (Registration).
 * Representa la inscripción de un usuario a un evento, con su estado (confirmada o cancelada).
 */
const registrationSchema = new mongoose.Schema(
  {
    /** Referencia al usuario (User) que se inscribe. */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Referencia al evento (Event) al que se inscribe el usuario. */
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    /** Estado de la inscripción. */
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  },
  { timestamps: true } // Agrega automáticamente createdAt y updatedAt
);

// Índice único compuesto: evita que un mismo usuario se inscriba dos veces al mismo evento
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

// Exporta el modelo 'Registration' basado en el esquema definido arriba
module.exports = mongoose.model('Registration', registrationSchema);