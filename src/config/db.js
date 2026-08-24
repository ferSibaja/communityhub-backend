const mongoose = require('mongoose');

/**
 * Establece la conexión con la base de datos MongoDB usando la URI
 * definida en las variables de entorno. Si la conexión falla, termina
 * el proceso de la aplicación.
 * @returns {Promise<void>} No retorna ningún valor; conecta mongoose globalmente.
 */
async function connectDB() {
  // URI de conexión a MongoDB obtenida de las variables de entorno
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI no está definida en las variables de entorno');
  }

  try {
    await mongoose.connect(uri);
    console.log('[db] Conectado a MongoDB');
  } catch (error) {
    console.error('[db] Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
}

// Exporta la función de conexión para usarla al iniciar el servidor
module.exports = connectDB;
