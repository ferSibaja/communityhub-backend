# CommunityHub — Backend

API REST construida con Express.js + MongoDB (Mongoose) para la plataforma CommunityHub.

## Estructura

```
backend/
├── src/
│   ├── config/       # Configuración (conexión a MongoDB, etc.)
│   ├── controllers/  # Lógica de las rutas (request/response)
│   ├── middleware/   # Autenticación, autorización, manejo de errores
│   ├── models/       # Esquemas de Mongoose
│   ├── routes/       # Definición de endpoints
│   ├── services/     # Lógica de negocio reutilizable
│   ├── utils/        # Utilidades (JWT, errores)
│   └── app.js         # Configuración de Express
│   └── server.js      # Punto de entrada (conecta DB y levanta el servidor)
├── .env               # Variables de entorno (no versionado)
└── package.json
```

## Instalación

```bash
cd backend
npm install
cp ../.env.example .env   # completar con tus propios valores
npm run dev                # requiere nodemon (devDependency)
```

El servidor corre por defecto en `http://localhost:3000`.

## Estado actual

Implementado:
- Conexión a MongoDB (Mongoose)
- Modelos: `User`, `Event`, `Category`, `Registration`, `Favorite`, `Notification`
- Autenticación con JWT + bcrypt: `register`, `login`, `me`, `logout`
- Middleware de autenticación (`authenticate`) y autorización por rol (`authorize`)
- Manejo centralizado de errores (sin exponer detalles internos de MongoDB)

Pendiente:
- CRUD de actividades, inscripciones, favoritos, búsqueda/filtros, dashboards

## Endpoints disponibles

| Método | Ruta | Protegido | Descripción |
|---|---|---|---|
| GET | `/api/health` | No | Verifica que la API esté activa |
| POST | `/api/auth/register` | No | Registra un nuevo usuario |
| POST | `/api/auth/login` | No | Inicia sesión y retorna un JWT |
| GET | `/api/auth/me` | Sí | Retorna el usuario autenticado |
| POST | `/api/auth/logout` | Sí | Cierra la sesión (invalidación en cliente) |

## Roles

`admin`, `organizer`, `user` (definidos en `models/User.js`, campo `role`).