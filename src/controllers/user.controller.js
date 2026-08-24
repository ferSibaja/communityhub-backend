const userService = require('../services/user.service');

/**
 * Controlador que obtiene la lista de todos los usuarios.
 * Maneja GET /api/users.
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function getUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que obtiene un usuario específico por su id.
 * Maneja GET /api/users/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el id del usuario en req.params.id.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function getUser(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que actualiza los datos de un usuario existente.
 * Maneja PUT/PATCH /api/users/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el id en req.params.id, los datos a actualizar en el body y el usuario autenticado en req.user.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que elimina un usuario existente.
 * Maneja DELETE /api/users/:id.
 * @param {import('express').Request} req - Solicitud HTTP con el id del usuario en req.params.id.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function deleteUser(req, res, next) {
  try {
    await userService.deleteUser(req.params.id, req.user);
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controlador que sube y actualiza la foto de perfil (avatar) del usuario autenticado.
 * Requiere que el middleware de subida de archivos (multer) haya colocado el
 * archivo en req.file.
 * Maneja POST /api/users/avatar.
 * @param {import('express').Request} req - Solicitud HTTP con el archivo subido en req.file y el usuario autenticado en req.user.
 * @param {import('express').Response} res - Respuesta HTTP.
 * @param {import('express').NextFunction} next - Middleware para pasar errores al manejador de errores.
 * @returns {Promise<void>}
 */
async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      throw require('../utils/ApiError').badRequest('No se proporcionó ningún archivo de imagen');
    }

    // URL pública completa donde queda accesible la imagen subida
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const user = await userService.updateUser(req.user.id, { profilePicture: fileUrl }, req.user);

    res.json({
      success: true,
      message: 'Foto de perfil actualizada correctamente',
      data: {
        user,
        profilePicture: fileUrl,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Exporta los controladores de usuarios para usarlos en las rutas
module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadAvatar,
};