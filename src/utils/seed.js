require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Category = require('../models/Category');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');

/**
 * Script de poblamiento (seed) de la base de datos.
 * Conecta a MongoDB, limpia todas las colecciones existentes y crea
 * usuarios, categorías, actividades, una inscripción y un favorito de prueba.
 * Termina el proceso con código 0 en éxito o 1 en caso de error.
 * @returns {Promise<void>}
 */
async function seed() {
  // URI de conexión a MongoDB, tomada de las variables de entorno o un valor local por defecto.
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/communityhub';
  console.log(`Conectando a MongoDB en: ${mongoUri}...`);

  try {
    await mongoose.connect(mongoUri);
    console.log('Conexión exitosa a la base de datos.');

    console.log('Limpiando colecciones existentes...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Favorite.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('Creando usuarios iniciales...');
    // Contraseña de prueba compartida por los tres usuarios semilla, ya encriptada.
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Usuario administrador de prueba.
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'Sistema',
      email: 'admin@communityhub.com',
      password: hashedPassword,
      role: 'administrador',
    });

    // Usuario organizador de prueba.
    const organizer = await User.create({
      firstName: 'Carlos',
      lastName: 'Mendoza',
      email: 'organizer@communityhub.com',
      password: hashedPassword,
      role: 'organizador',
    });

    // Usuario regular de prueba.
    const user = await User.create({
      firstName: 'Lucía',
      lastName: 'Gómez',
      email: 'user@communityhub.com',
      password: hashedPassword,
      role: 'usuario',
    });

    console.log('Usuarios creados:');
    console.log(` - Admin: admin@communityhub.com / password123`);
    console.log(` - Organizador: organizer@communityhub.com / password123`);
    console.log(` - Usuario: user@communityhub.com / password123`);

    console.log('Creando categorías...');
    // Datos iniciales de las categorías de actividades disponibles en la plataforma.
    const categoriesData = [
      { name: 'Tecnología', description: 'Talleres, charlas y hackathons de software y tecnología.' },
      { name: 'Deportes', description: 'Actividades físicas, partidos comunitarios y torneos.' },
      { name: 'Cultura & Arte', description: 'Exposiciones, música en vivo, teatro y festivales.' },
      { name: 'Educación', description: 'Cursos, conferencias y grupos de estudio.' },
      { name: 'Social & Comunidad', description: 'Encuentros vecinales, voluntariado y networking.' },
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log(`Se crearon ${categories.length} categorías.`);

    // Referencias a categorías específicas usadas al crear las actividades de ejemplo.
    const techCat = categories.find((c) => c.name === 'Tecnología');
    const sportsCat = categories.find((c) => c.name === 'Deportes');
    const cultureCat = categories.find((c) => c.name === 'Cultura & Arte');

    // Fecha de mañana, usada como fecha de la primera actividad de ejemplo.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fecha dentro de una semana, usada para la segunda actividad de ejemplo.
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Fecha dentro de dos semanas, usada para la tercera actividad de ejemplo.
    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

    console.log('Creando actividades iniciales...');
    const events = await Event.insertMany([
      {
        title: 'Workshop de Node.js y Express Avanzado',
        description: 'Aprende a construir APIs REST robustas, escalables y seguras con Node.js, Express y MongoDB.',
        category: techCat._id,
        date: tomorrow,
        time: '18:00',
        location: 'Auditorio Central, San José',
        capacity: 30,
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        organizer: organizer._id,
        status: 'active',
      },
      {
        title: 'Torneo Comunitario de Fútbol 5',
        description: 'Ven a participar del gran torneo de verano vecinal. Habrá premios para los tres primeros lugares.',
        category: sportsCat._id,
        date: nextWeek,
        time: '09:00',
        location: 'Polideportivo Municipal, Heredia',
        capacity: 50,
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        organizer: organizer._id,
        status: 'active',
      },
      {
        title: 'Noche de Cine y Arte Urbano',
        description: 'Proyección al aire libre de cortometrajes independientes y muestra fotográfica local.',
        category: cultureCat._id,
        date: inTwoWeeks,
        time: '19:30',
        location: 'Plaza de la Cultura, San José',
        capacity: 100,
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        organizer: admin._id,
        status: 'active',
      },
    ]);

    console.log(`Se crearon ${events.length} actividades.`);

    // Inscripción de prueba del usuario regular en la primera actividad.
    await Registration.create({
      user: user._id,
      event: events[0]._id,
      status: 'confirmed',
    });

    // Favorito de prueba del usuario regular sobre la primera actividad.
    await Favorite.create({
      user: user._id,
      event: events[0]._id,
    });

    console.log('Inscripción y favorito de prueba creados exitosamente.');
    console.log('✅ Poblamiento de base de datos completado.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  }
}

// Ejecuta el script de poblamiento al invocar este archivo directamente.
seed();
