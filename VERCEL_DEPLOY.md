# Guía de Despliegue en Vercel

## Pasos para Desplegar

### 1. Preparación del Proyecto

El proyecto ya está configurado con:
- ✅ `vercel.json` - Configuración de Vercel
- ✅ Build script funcionando
- ✅ Rutas configuradas para React Router

### 2. Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Vite

### 3. Configurar Variables de Entorno

**IMPORTANTE**: Debes configurar estas variables en Vercel antes del despliegue:

1. En la configuración del proyecto en Vercel, ve a **Settings > Environment Variables**
2. Agrega las siguientes variables:

```
VITE_SUPABASE_URL=https://tu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**Cómo obtener estos valores:**
- Ve a tu proyecto en [Supabase](https://app.supabase.com)
- Settings > API
- Copia el **Project URL** → `VITE_SUPABASE_URL`
- Copia el **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### 4. Configuración del Build

Vercel detectará automáticamente:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Desplegar

1. Haz clic en "Deploy"
2. Espera a que termine el build
3. Tu aplicación estará disponible en `tu-proyecto.vercel.app`

## Configuración de Rutas (SPA)

El archivo `vercel.json` ya está configurado para que React Router funcione correctamente. Todas las rutas se redirigen a `index.html` para que el enrutamiento del lado del cliente funcione.

## Solución de Problemas

### Error: Variables de entorno no encontradas
- Asegúrate de haber configurado `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Vercel
- Las variables deben tener el prefijo `VITE_` para que Vite las incluya en el build

### Error 404 en rutas
- Verifica que `vercel.json` tenga la configuración de `rewrites` correcta
- Asegúrate de que todas las rutas apunten a `/index.html`

### Build falla
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Vercel para ver el error específico

## Notas Importantes

- El proyecto usa **npm** como gestor de paquetes
- Las variables de entorno deben configurarse en Vercel, no en un archivo `.env` (ese archivo no se sube a producción)
- El build genera archivos estáticos en la carpeta `dist/`
- Vercel automáticamente detecta cambios en `main` o `master` y despliega automáticamente

