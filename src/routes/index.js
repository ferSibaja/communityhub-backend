const express = require('express');
const authRoutes = require('./auth.routes');

const router = express.Router();

router.use('/auth', authRoutes);

// Próximas rutas a integrar: users, events, categories, registrations, favorites, notifications

module.exports = router;