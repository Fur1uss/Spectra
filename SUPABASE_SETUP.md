# Configuración de Supabase para Verificación de Email

## Problema Resuelto

Cuando un usuario se registra, Supabase envía un email de confirmación. Al hacer clic en el enlace, el usuario es redirigido con tokens de autenticación en la URL. Ahora estos tokens se procesan automáticamente.

## Cambios Implementados

1. **URL de redirección configurada**: El registro ahora redirige a `/auth/callback`
2. **Componente AuthCallback**: Procesa los tokens y autentica al usuario automáticamente
3. **Creación automática de perfil**: Si es el primer login, crea el perfil en la tabla `User`

## Configuración en Supabase Dashboard

**IMPORTANTE**: El problema de `localhost:3000` se debe a que la **Site URL** en Supabase está mal configurada. Debes cambiarla.

### Pasos para corregir:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Authentication** (menú lateral) > **URL Configuration**
3. **Cambia la Site URL** (esta es la que está causando el problema):
   - **Para desarrollo**: Cambia de `http://localhost:3000` a `http://localhost:5173` (o el puerto que uses con Vite)
   - **Para producción**: `https://tu-dominio.vercel.app`
4. En **Redirect URLs**, agrega estas URLs (una por línea):
   ```
   http://localhost:5173/auth/callback
   https://tu-dominio.vercel.app/auth/callback
   http://localhost:5173/**
   https://tu-dominio.vercel.app/**
   ```

### ⚠️ Por qué es importante:

- La **Site URL** es la URL base que Supabase usa por defecto para redirecciones
- Si está en `localhost:3000`, todos los emails de confirmación redirigirán ahí
- Aunque el código especifica `emailRedirectTo`, Supabase puede usar la Site URL como base
- **Debes cambiarla a `localhost:5173`** (puerto por defecto de Vite) o el puerto que uses

### Ejemplo de configuración:

```
Site URL: https://tu-proyecto.vercel.app

Redirect URLs:
- http://localhost:5173/auth/callback
- https://tu-proyecto.vercel.app/auth/callback
- http://localhost:5173/**
- https://tu-proyecto.vercel.app/**
```

## Flujo de Verificación

1. Usuario se registra → Recibe email de confirmación
2. Usuario hace clic en el enlace del email
3. Supabase redirige a `/auth/callback` con tokens en la URL
4. El componente `AuthCallback` procesa los tokens
5. Establece la sesión en Supabase
6. Crea el perfil en la tabla `User` si no existe
7. Autentica al usuario y redirige a `/hub`

## Notas Importantes

- La URL de redirección se genera dinámicamente usando `window.location.origin`
- Funciona tanto en desarrollo como en producción
- El componente maneja errores y muestra mensajes apropiados
- Si hay un error, redirige al login después de 3 segundos

