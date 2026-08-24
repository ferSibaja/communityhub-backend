const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');

// Ruta absoluta de la carpeta donde se guardan los archivos subidos
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento en disco de multer: define dónde y con qué
// nombre se guarda cada archivo subido
const storage = multer.diskStorage({
  /**
   * Determina la carpeta de destino donde se guardará el archivo subido.
   * @param {import('express').Request} req - Solicitud HTTP.
   * @param {Express.Multer.File} file - Archivo recibido.
   * @param {(error: Error|null, destination: string) => void} cb - Callback de multer con la carpeta destino.
   * @returns {void}
   */
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  /**
   * Genera un nombre único para el archivo subido, combinando el nombre del
   * campo, un sufijo único (timestamp + número aleatorio) y la extensión original.
   * @param {import('express').Request} req - Solicitud HTTP.
   * @param {Express.Multer.File} file - Archivo recibido.
   * @param {(error: Error|null, filename: string) => void} cb - Callback de multer con el nombre final del archivo.
   * @returns {void}
   */
  filename: function (req, file, cb) {
    // Sufijo único basado en la marca de tiempo actual y un número aleatorio, para evitar colisiones de nombres
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

/**
 * Filtro de archivos de multer que solo permite subir imágenes en los
 * formatos aceptados (JPEG, PNG, WEBP, GIF).
 * @param {import('express').Request} req - Solicitud HTTP.
 * @param {Express.Multer.File} file - Archivo recibido, incluyendo su mimetype.
 * @param {(error: Error|null, acceptFile: boolean) => void} cb - Callback de multer indicando si el archivo se acepta o se rechaza.
 * @returns {void}
 */
const fileFilter = (req, file, cb) => {
  // Tipos MIME de imagen permitidos para la subida de archivos
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Formato de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WEBP, GIF)'), false);
  }
};

// Instancia de multer configurada con el almacenamiento, el filtro de
// archivos y un límite de tamaño máximo de 5MB por archivo
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Exporta el middleware de subida de archivos configurado para usarlo en las rutas
module.exports = upload;