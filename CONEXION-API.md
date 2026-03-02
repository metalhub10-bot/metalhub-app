# Conexión Frontend (MetalHub) ↔ Backend API

## Configuración

- **URL del backend**: variable de entorno `EXPO_PUBLIC_API_URL` (archivo `.env` en la raíz de `mobil/`).
- Ejemplo `.env`:
  ```
  EXPO_PUBLIC_API_URL=http://localhost:3000
  ```
- En dispositivo físico usa la IP de tu máquina (ej: `http://192.168.1.10:3000`).

## Estructura

- **`services/api.ts`**: cliente central de la API.
  - Todas las llamadas HTTP al backend.
  - Sesión guardada en AsyncStorage y enviada en cabecera `X-Session-Id` en rutas protegidas.
- **Pantallas**: importan funciones de `@/services/api` y muestran loading/error con `Alert` o estado local.

## Cómo consumir un endpoint

### Ejemplo: login

```ts
import { loginUser, setSessionId, assertSuccess } from '@/services/api';

const res = await loginUser(email, password);
assertSuccess(res);  // lanza si success === false
if (res.sessionId) await setSessionId(res.sessionId);
// res.user tiene los datos del usuario
```

### Ejemplo: listado (GET)

```ts
import { getPublicaciones } from '@/services/api';

const res = await getPublicaciones({ tipo: 'venden', orden: 'precio_asc', limite: 20 });
if (res.success && res.data) {
  setListings(res.data);
  setTotal(res.total ?? 0);
}
```

### Ejemplo: crear recurso (POST) con sesión

```ts
import { getSessionId, createPublicacion, assertSuccess } from '@/services/api';

const sessionId = await getSessionId();
if (!sessionId) {
  Alert.alert('Sesión requerida', 'Inicia sesión para publicar.');
  return;
}
const res = await createPublicacion({ tipo: 'vendo', metal: 'Cobre', ... });
assertSuccess(res);
```

## Respuesta estándar del backend

- **Éxito**: `{ success: true, data?: ..., message?: ..., user?: ..., sessionId?: ... }`
- **Error**: `{ success: false, message?: string, error?: string }`

Usar `assertSuccess(res)` para lanzar con el mensaje de error si `success === false`, o comprobar `res.success` y mostrar `res.message` / `res.error` al usuario.

## Errores y feedback

- Errores de red o respuestas con `success: false` se muestran con `Alert.alert('Error', message)`.
- Estados de carga con `ActivityIndicator` y `loading`/`submitting` en pantalla.

## Rutas del backend usadas

| Pantalla   | Llamadas API |
|-----------|---------------|
| Login     | `POST /api/v1/auth/login` |
| Register  | `POST /api/v1/auth/register` |
| Mercado   | `GET /api/v1/publicaciones` (filtros y orden) |
| Detalle   | `GET /api/v1/publicaciones/:id` |
| Publicar  | `GET /api/v1/metales`, `POST /api/v1/publicaciones` (con sesión) |
| Perfil    | `GET /api/v1/users/me`, `GET /api/v1/suscripcion`, `POST /api/v1/auth/logout` |

Sesión: tras login se guarda `sessionId`; las rutas protegidas envían cabecera `X-Session-Id`.
