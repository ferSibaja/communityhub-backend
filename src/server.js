// Punto de entrada del servidor: carga variables de entorno, conecta la base de datos
// y arranca el servidor HTTP de Express.

require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const app = require('./app');
const connectDB = require('./config/db');

// Puerto en el que escuchará el servidor (por defecto 3000 si no está definido en el entorno)
const PORT = process.env.PORT || 3000;

/**
 * Inicializa la aplicación: conecta a la base de datos y luego pone el servidor a escuchar.
 */
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[server] CommunityHub API escuchando en el puerto ${PORT}`);
  });
}

start();