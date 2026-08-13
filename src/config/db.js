const mongoose = require('mongoose');

async function connectDB() {
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

module.exports = connectDB;