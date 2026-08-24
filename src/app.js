// Configuración principal de la aplicación Express: middlewares, rutas y manejo de errores.

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const path = require('path');

const app = express();

// Lista de orígenes permitidos para CORS, tomada de la variable de entorno FRONTEND_URL
// (separados por comas) o, en su defecto, los orígenes de desarrollo local.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((o) => o.trim());

// Habilita CORS solo para los orígenes permitidos y permite el envío de credenciales (cookies/headers de auth).
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por la política de CORS'));
      }
    },
    credentials: true,
  })
);
// Parsea el cuerpo de las peticiones en formato JSON (límite de 10mb, por ejemplo para imágenes en base64).
app.use(express.json({ limit: '10mb' }));
// Parsea el cuerpo de las peticiones en formato urlencoded (formularios).
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sirve de forma estática los archivos subidos (imágenes de perfil, eventos, etc.) bajo /uploads.
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/** GET /api/health - Endpoint de verificación de estado (health check) de la API. */
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'CommunityHub API funcionando' });
});

// Monta todas las rutas de la API bajo el prefijo /api.
app.use('/api', routes);

// Middleware para rutas no encontradas (404).
app.use(notFound);
// Middleware centralizado de manejo de errores.
app.use(errorHandler);

module.exports = app;