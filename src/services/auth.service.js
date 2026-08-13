const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

async function register({ firstName, lastName, email, password, profilePicture }) {
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    throw ApiError.conflict('Ya existe una cuenta registrada con este correo electrónico');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    profilePicture: profilePicture || null,
  });

  const token = generateToken({ id: user._id, role: user.role });

  return { user: sanitizeUser(user), token };
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Correo electrónico o contraseña incorrectos');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Correo electrónico o contraseña incorrectos');
  }

  const token = generateToken({ id: user._id, role: user.role });

  return { user: sanitizeUser(user), token };
}

function sanitizeUser(user) {
  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePicture: user.profilePicture,
    role: user.role,
    createdAt: user.createdAt,
  };
}

module.exports = { register, login, sanitizeUser };