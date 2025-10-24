# Guía de React Router DOM - Proyecto Spectra

## Configuración Implementada

React Router DOM ha sido implementado exitosamente en el proyecto Spectra. Aquí está la configuración:

### 1. Estructura de Rutas

Las siguientes rutas están configuradas en `src/App.jsx`:

- `/` - Página principal (Home)
- `/login` - Página de inicio de sesión
- `/main` - Página principal alternativa
- `/welcome` - Página de bienvenida
- `/hub` - Hub de casos
- `/registration` - Página de registro
- `/upload` - Subir casos
- `/view-case` - Ver casos específicos
- `/extra-case` - Casos adicionales

### 2. Navegación

#### Navegación con Links
```jsx
import { Link } from 'react-router-dom';

<Link to="/login">Ir a Login</Link>
```

#### Navegación Programática
```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/upload'); // Navegar programáticamente
```

### 3. Componentes Actualizados

- **NavBar**: Ahora usa `Link` para navegación
- **ElementCard**: Incluye ejemplo de navegación programática
- **App.jsx**: Configurado con `Routes` y `Route`
- **main.jsx**: Envuelto con `BrowserRouter`

### 4. Uso Básico

Para agregar nuevas rutas:

1. Crear el componente de página
2. Importarlo en `App.jsx`
3. Agregar la ruta en el componente `Routes`

```jsx
<Route path="/nueva-ruta" element={<NuevoComponente />} />
```

### 5. Navegación en el NavBar

El NavBar incluye enlaces a:
- Home (`/`)
- Casos (`/hub`)
- Ingresar (`/login`)

### 6. Ejemplo de Navegación Programática

En `ElementCard.jsx` se muestra cómo usar `useNavigate` para navegar programáticamente cuando se hace clic en el botón "Subir mi caso".

## Próximos Pasos

1. Implementar los componentes de página faltantes
2. Agregar rutas protegidas si es necesario
3. Implementar navegación con parámetros para casos específicos
4. Agregar manejo de errores 404

¡React Router DOM está listo para usar en tu proyecto Spectra!
