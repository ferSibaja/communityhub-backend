const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría es obligatoria'],
    },
    date: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
      validate: {
        validator: function (value) {
          // No permitir fechas pasadas al crear el evento
          return value >= new Date();
        },
        message: 'La fecha del evento no puede ser en el pasado',
      },
    },
    time: {
      type: String, // formato "HH:mm"
      required: [true, 'La hora es obligatoria'],
    },
    location: {
      type: String,
      required: [true, 'La ubicación es obligatoria'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'La capacidad máxima es obligatoria'],
      min: [1, 'La capacidad debe ser mayor a 0'],
    },
    image: {
      type: String,
      default: null,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'finished'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);