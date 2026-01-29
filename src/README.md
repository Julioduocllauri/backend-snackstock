# SnackStock Backend - Estructura Profesional

## 📁 Estructura del Proyecto

```
src/
├── commands/               # Comandos CLI (vacío, para futuro)
├── config/                 # Configuraciones
│   └── supabase.js        # Cliente Supabase
├── controllers/            # Controladores (lógica de negocio)
│   ├── ArticlesController.js   # CRUD de artículos
│   ├── AuthController.js       # Autenticación
│   └── recipeController.js     # Generación de recetas IA
├── middlewares/            # Middlewares
│   ├── authMiddleware.js       # Verificación de autenticación
│   └── errorHandler.js         # Manejo global de errores
├── migrations/             # Migraciones SQL
│   └── 20240101000000_create_tables.sql
├── models/                 # Modelos de datos
│   ├── Article.js         # Modelo de artículos/inventario
│   ├── User.js            # Modelo de usuarios
│   └── Model.js           # Barrel export
├── routes/                 # Rutas de la API
│   ├── api.js             # Definición de endpoints
│   ├── router.js          # Router principal
│   └── index.js           # Exportador de rutas
├── seeds/                  # Seeds (datos de prueba)
│   └── 01_users.sql       # Usuarios y artículos de prueba
├── services/               # Servicios (lógica reutilizable)
│   └── receiptService.js  # Procesamiento de boletas OCR
├── app.js                  # Configuración Express
└── server.js               # Punto de entrada
```

## 🎯 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile/:userId` - Obtener perfil

### Artículos (Inventario)
- `GET /api/articles?userId=xxx` - Listar artículos
- `GET /api/articles/critical?userId=xxx` - Artículos críticos
- `GET /api/articles/:id` - Ver artículo
- `POST /api/articles` - Crear artículo
- `PUT /api/articles/:id` - Actualizar artículo
- `DELETE /api/articles/:id` - Eliminar artículo

### Recetas
- `POST /api/generate-recipe` - Generar receta con IA

### Boletas (OCR)
- `POST /api/process-receipt` - Procesar boleta escaneada

### Legacy (Compatibilidad)
- `GET /api/inventory` - Alias de `/api/articles`

## 🔧 Configuración

1. **Copiar archivo de entorno:**
   ```bash
   copy .env.ejmplo .env
   ```

2. **Configurar variables de entorno en `.env`:**
   ```env
   PORT=3000
   SUPABASE_URL=tu-url-de-supabase
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   GROQ_API_KEY=tu-groq-api-key
   ```

3. **Instalar dependencias:**
   ```bash
   npm install
   ```

4. **Ejecutar migraciones en Supabase:**
   - Ir a Supabase Dashboard > SQL Editor
   - Copiar y ejecutar `src/migrations/20240101000000_create_tables.sql`

5. **Ejecutar seeds (opcional, solo desarrollo):**
   - Ejecutar `src/seeds/01_users.sql` en SQL Editor

6. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

## 📦 Modelos

### User
```javascript
{
  id: UUID,
  email: String,
  password: String,
  name: String,
  created_at: DateTime,
  updated_at: DateTime
}
```

### Article (Inventory)
```javascript
{
  id: Integer,
  user_id: UUID,
  name: String,
  quantity: Integer,
  category: String,
  expiry_date: Date,
  created_at: DateTime,
  updated_at: DateTime,
  // Calculados dinámicamente:
  days_left: Integer,
  status: 'red' | 'yellow' | 'green'
}
```

## 🔐 Seguridad

- **Row Level Security (RLS)** habilitado en Supabase
- Políticas para que usuarios solo vean sus propios datos
- En producción: implementar JWT y bcrypt para passwords

## 🚀 Mejoras Pendientes

- [ ] Implementar JWT tokens
- [ ] Hash de passwords con bcrypt
- [ ] Validación de datos con express-validator
- [ ] Tests unitarios
- [ ] Documentación Swagger
- [ ] Rate limiting
- [ ] Logs con Winston
- [ ] Caché con Redis

## 📝 Notas

- Los cálculos de `days_left` y `status` se hacen dinámicamente en el backend
- La tabla `inventory` solo guarda `expiry_date`
- El servicio de Groq AI requiere API key válida
- Compatible con el frontend existente (rutas legacy mantenidas)
