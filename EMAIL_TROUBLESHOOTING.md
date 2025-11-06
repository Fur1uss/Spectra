# Solución de Problemas: Emails de Confirmación No Llegan

## Posibles Causas y Soluciones

### 1. ✅ Verificar Configuración de Email en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Authentication** > **Providers** > **Email**
3. Verifica que:
   - ✅ **Enable email confirmations** esté activado
   - ✅ **Enable email change confirmations** esté activado (opcional)
   - ✅ El template de email esté configurado

### 2. 📧 Verificar Carpeta de Spam

- Los emails de Supabase pueden llegar a la carpeta de **spam** o **correo no deseado**
- Revisa también la carpeta de **promociones** en Gmail
- Agrega `noreply@mail.app.supabase.io` a tus contactos

### 3. ⏱️ Límites de Rate Limiting

Supabase tiene límites en el plan gratuito:
- **4 emails por hora** por usuario
- Si intentas registrarte varias veces, puede que no lleguen más emails

**Solución**: Espera 1 hora antes de intentar de nuevo, o verifica en la consola de Supabase si hay errores.

### 4. 🔍 Verificar Logs en Supabase

1. Ve a **Logs** > **Auth Logs** en Supabase Dashboard
2. Busca errores relacionados con el envío de emails
3. Verifica si hay mensajes de error como:
   - "Email rate limit exceeded"
   - "Email provider error"
   - "Invalid email template"

### 5. 📝 Verificar Email Templates

1. Ve a **Authentication** > **Email Templates** en Supabase
2. Verifica que el template **Confirm signup** esté configurado
3. El template debe tener:
   - `{{ .ConfirmationURL }}` para el enlace de confirmación
   - Contenido HTML/texto apropiado

### 6. 🧪 Probar con Email de Prueba

Prueba registrarte con diferentes proveedores de email:
- Gmail
- Outlook
- Yahoo
- Otro proveedor

Algunos proveedores pueden bloquear emails de Supabase.

### 7. 🔧 Verificar Configuración del Proyecto

En **Project Settings** > **API**:
- Verifica que las variables de entorno estén correctas
- Verifica que no haya restricciones de dominio

### 8. 💡 Solución Temporal: Deshabilitar Confirmación de Email

Si necesitas probar sin confirmación de email (solo para desarrollo):

1. Ve a **Authentication** > **Providers** > **Email**
2. Desactiva temporalmente **Enable email confirmations**
3. ⚠️ **ADVERTENCIA**: Esto permite que cualquier usuario se registre sin confirmar email
4. Solo úsalo para desarrollo, nunca en producción

### 9. 📊 Verificar Estado del Usuario

Puedes verificar si el usuario se creó correctamente:

1. Ve a **Authentication** > **Users** en Supabase
2. Busca el email del usuario
3. Verifica el estado:
   - Si dice "Unconfirmed" → El email no se ha confirmado
   - Si dice "Confirmed" → El email ya se confirmó (puede que hayas hecho clic sin darte cuenta)

### 10. 🔄 Reenviar Email de Confirmación

Si el usuario ya existe pero no recibió el email, puedes:

1. Ir a **Authentication** > **Users**
2. Buscar el usuario
3. Hacer clic en los tres puntos (...) > **Resend confirmation email**

O implementar un botón en la app para reenviar el email (requiere código adicional).

## Código para Reenviar Email (Opcional)

Si quieres agregar funcionalidad para reenviar el email de confirmación:

```javascript
// En src/utils/auth.js
export const resendConfirmationEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    return { success: true, message: 'Email de confirmación reenviado' }
  } catch (error) {
    throw error
  }
}
```

## Checklist Rápido

- [ ] Email confirmations habilitado en Supabase
- [ ] Revisar carpeta de spam
- [ ] Verificar logs de Auth en Supabase
- [ ] Verificar que no se excedió el rate limit (4 emails/hora)
- [ ] Probar con otro proveedor de email
- [ ] Verificar que el template de email esté configurado
- [ ] Verificar estado del usuario en Supabase Dashboard

## Contactar Soporte

Si nada funciona:
1. Revisa los logs en Supabase Dashboard
2. Verifica el estado de tu proyecto en Supabase
3. Contacta soporte de Supabase si el problema persiste

