# Documentación de Base de Datos - Spectra

## Estructura General

La base de datos de Spectra está alojada en **Supabase** (PostgreSQL) y contiene las siguientes tablas principales para gestionar casos paranormales, usuarios y comentarios.

---

## Tablas

### 1. **User**
Tabla para almacenar información de usuarios registrados en la plataforma.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO INCREMENT | Identificador único del usuario |
| `username` | character varying | NOT NULL, UNIQUE | Nombre de usuario (único) |
| `password` | character varying | NULL | Contraseña hasheada (bcryptjs) |
| `email` | character varying | NULL | Correo electrónico |
| `first_name` | character varying | NULL | Nombre |
| `last_name` | character varying | NULL | Apellido |
| `birthday` | date | NULL | Fecha de nacimiento |
| `created_at` | timestamp with time zone | DEFAULT NOW() | Fecha de creación |

**Relaciones:**
- `1:N` → `Case` (un usuario puede crear muchos casos)
- `1:N` → `Comment` (un usuario puede hacer muchos comentarios)

**Ejemplo de inserción (auth.js):**
```javascript
supabase.from('User').insert([{
  username: 'usuario123',
  password: hashedPassword,
  email: 'user@example.com',
  first_name: 'Juan',
  last_name: 'Pérez',
  birthday: '1990-05-15'
}])
```

---

### 2. **Case_Type**
Tabla que almacena los tipos de casos paranormales disponibles.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO INCREMENT | Identificador único del tipo |
| `nombre_Caso` | character varying | NULL | Nombre del tipo de caso (ej: Ufología, Criptozoología, etc.) |

**Ejemplos de tipos de casos:**
- Ufología
- Criptozoología
- Entidades paranormales
- Actividad poltergeist
- Fenómenos inexplicables

**Relaciones:**
- `1:N` → `Case` (un tipo de caso puede tener muchos casos)

---

### 3. **Location**
Tabla para almacenar ubicaciones donde ocurrieron los casos.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO INCREMENT | Identificador único de la ubicación |
| `address` | text | NOT NULL | Dirección/localidad específica |
| `country` | character varying | NULL | País |

**Relaciones:**
- `1:N` → `Case` (una ubicación puede tener muchos casos)

**Nota:** Se utiliza `createOrGetLocation()` en uploadHandler.js para buscar ubicaciones existentes antes de crear nuevas.

---

### 4. **Case**
Tabla principal para almacenar los casos paranormales reportados.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO INCREMENT | Identificador único del caso |
| `user` | bigint | FK → User.id, ON DELETE RESTRICT | ID del usuario que reporta el caso |
| `caseType` | bigint | FK → Case_Type.id, ON DELETE CASCADE | Tipo de caso paranormal |
| `timeHour` | timestamp with time zone | DEFAULT NOW() | Fecha y hora del evento paranormal |
| `description` | text | NULL | Descripción detallada del evento (mín. 50 caracteres) |
| `location` | bigint | FK → Location.id, ON DELETE CASCADE | Ubicación donde ocurrió |

**Relaciones:**
- `N:1` → `User` (muchos casos por usuario)
- `N:1` → `Case_Type` (muchos casos del mismo tipo)
- `N:1` → `Location` (muchos casos en la misma ubicación)
- `1:N` → `Files` (un caso puede tener múltiples archivos multimedia)
- `1:N` → `Comment` (un caso puede tener múltiples comentarios)

**Reglas de validación (UploadStepper.jsx):**
- `caseType`: Obligatorio
- `timeHour`: Obligatorio
- `description`: Mínimo 50 caracteres, obligatorio
- `location`: Generado automáticamente a partir de país/región/dirección

**Ejemplo de creación (uploadHandler.js):**
```javascript
supabase.from('Case').insert([{
  user: userId,
  caseType: caseTypeId,
  description: 'Descripción del evento...',
  timeHour: timeValue,
  location: locationId
}])
```

---

### 5. **Files**
Tabla para almacenar referencias a archivos multimedia (imágenes, videos, audios) de los casos.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO INCREMENT | Identificador único del archivo |
| `Case` | bigint | FK → Case.id, ON DELETE CASCADE | ID del caso asociado |
| `url` | character varying | NULL | URL pública del archivo en Supabase Storage |

**Restricciones por tipo (validateFiles):**
- **Imágenes (JPG, PNG, WebP, GIF)**: Ilimitadas
- **Videos (MP4, WebM, MOV)**: Máximo 1 por caso
- **Audios (MP3, WAV, M4A, AAC)**: Máximo 2 por caso

**Almacenamiento:**
- Bucket: `multimedia`
- Ruta: `caso_{caseId}/{subfolder}/{fileName}`
  - `subfolder`: `fotos`, `videos`, o `audios`

**Relaciones:**
- `N:1` → `Case` (muchos archivos por caso)

---

### 6. **Comment**
Tabla para almacenar comentarios en los casos (comunidad).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | bigint | PRIMARY KEY, AUTO INCREMENT | Identificador único del comentario |
| `createdAt` | timestamp with time zone | DEFAULT NOW() | Fecha de creación del comentario |
| `commentText` | character varying | NULL | Contenido del comentario |
| `userId` | bigint | FK → User.id, ON DELETE CASCADE | Usuario que hace el comentario |
| `likes` | integer | NOT NULL | Número de likes (por defecto 0) |
| `dislikes` | integer | NULL | Número de dislikes |
| `caseId` | bigint | FK → Case.id, ON DELETE CASCADE | Caso al que pertenece el comentario |

**Relaciones:**
- `N:1` → `User` (un usuario puede hacer múltiples comentarios)
- `N:1` → `Case` (un caso puede tener múltiples comentarios)

---

## Flujos de Datos Principales

### Flujo: Crear un Caso Paranormal

1. **Usuario inicia sesión** → Se carga `User` desde tabla `User`
2. **Usuario completa formulario de caso** → 4 pasos:
   - Paso 1: Selecciona `Case_Type` y hora (`timeHour`)
   - Paso 2: Ingresa país/región/dirección → Se crea/obtiene `Location`
   - Paso 3: Redacta descripción
   - Paso 4: Sube archivos multimedia
3. **Se crea registro en tabla `Case`** con:
   - `user_id` (del usuario logeado)
   - `case_type_id` (seleccionado)
   - `location_id` (creado/obtenido)
   - `description`
   - `time_hour`
4. **Se suben archivos a Storage** → `multimedia` bucket
5. **Se registran URLs en tabla `Files`** → vinculadas al `Case`

### Flujo: Ver Caso y sus Detalles

1. Usuario accede a `/case/:caseId`
2. Se obtiene registro de `Case` por ID
3. Se obtienen archivos asociados de `Files`
4. Se obtienen comentarios de `Comment` asociados al caso
5. Se recuperan datos del usuario creador desde `User`
6. Se muestran todos los datos en `ViewCase`

---

## Relaciones y Restricciones

| Relación | Tipo | ON UPDATE | ON DELETE | Descripción |
|----------|------|-----------|-----------|-------------|
| Case → User | FK | CASCADE | RESTRICT | No se puede eliminar usuario con casos activos |
| Case → Case_Type | FK | CASCADE | CASCADE | Al eliminar tipo de caso, se eliminan todos los casos de ese tipo |
| Case → Location | FK | CASCADE | CASCADE | Al eliminar ubicación, se eliminan todos los casos de esa ubicación |
| Files → Case | FK | CASCADE | CASCADE | Al eliminar caso, se eliminan todos sus archivos |
| Comment → User | FK | CASCADE | CASCADE | Al eliminar usuario, se eliminan sus comentarios |
| Comment → Case | FK | CASCADE | CASCADE | Al eliminar caso, se eliminan sus comentarios |

---

## Consultas Principales Usadas en el Código

### En `auth.js`
```javascript
// Login: buscar usuario por username
supabase.from('User').select('*').eq('username', username)

// Registro: verificar si existe usuario
supabase.from('User').select('id').eq('username', username)

// Crear usuario
supabase.from('User').insert([{...userData}]).select().single()

// Obtener usuario por ID
supabase.from('User').select('*').eq('id', userId).single()
```

### En `uploadHandler.js`
```javascript
// Obtener tipos de casos
supabase.from('Case_Type').select('id, nombre_Caso').order('nombre_Caso')

// Buscar ubicación existente
supabase.from('Location').select('id').eq('address', address).eq('country', country).single()

// Crear ubicación
supabase.from('Location').insert([{...locationData}]).select()

// Crear caso
supabase.from('case').insert([{...caseData}]).select()

// Guardar archivos
supabase.from('files').insert(fileRecords)
```

---

## Variables de Entorno Requeridas

```env
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]
```

---

## Notas Importantes

1. **Contraseñas**: Se hashean con bcryptjs (10 salt rounds) antes de almacenarse
2. **Multimedia**: Se almacena en bucket de Supabase Storage, no en tabla `Files` (solo URLs)
3. **Rutas**: Los archivos se organizan por `caso_{caseId}/{tipo}/` (fotos, videos, audios)
4. **Timestamps**: Automáticos en servidor (NOW())
5. **Borrado en cascada**: Al eliminar un caso, se eliminan automáticamente Files y Comments
6. **Validación**: Se valida en frontend antes de enviar a BD

---

## Estado Actual del Desarrollo

- ✅ Tablas User, Case_Type, Location, Case, Files completamente implementadas
- ✅ Autenticación y registro funcionando
- ✅ Carga de casos con validación de archivos
- ⏳ Comment (comentarios): Tabla creada pero sin implementar en UI
- ⏳ Visualización de casos: En desarrollo

