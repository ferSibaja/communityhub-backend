const mongoose = require('mongoose');

/**
 * Esquema de Notificación.
 * Representa un mensaje/alerta dirigido a un usuario, opcionalmente asociado a un evento
 * (recordatorios, actualizaciones, cancelaciones, registros, avisos del sistema, reportes, etc.).
 */
const notificationSchema = new mongoose.Schema(
  {
    /** Referencia al usuario (User) destinatario de la notificación. */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Referencia al evento (Event) relacionado, si aplica. */
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
    /** Tipo/categoría de la notificación. */
    type: {
      type: String,
      enum: ['reminder', 'update', 'cancellation', 'cancellation_user', 'registration', 'system', 'report'],
      default: 'system',
    },
    /** Contenido textual de la notificación. */
    message: {
      type: String,
      required: true,
    },
    /** Indica si la notificación ya fue leída por el usuario. */
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
    // Configuración de serialización a JSON: incluye los virtuals y agrega alias "id"/"isRead"
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        ret.isRead = ret.read;
        return ret;
      },
    },
    // Configuración de serialización a objeto plano: mismo comportamiento que toJSON
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        ret.isRead = ret.read;
        return ret;
      },
    },
  }
);

/**
 * Virtual `isRead`: alias de lectura del campo `read`, expuesto para conveniencia del cliente.
 */
notificationSchema.virtual('isRead').get(function () {
  return this.read;
});

/**
 * Virtual `id`: representación en string (hex) del `_id` del documento.
 */
notificationSchema.virtual('id').get(function () {
  return this._id ? this._id.toHexString() : undefined;
});

// Exporta el modelo 'Notification' basado en el esquema definido arriba
module.exports = mongoose.model('Notification', notificationSchema);