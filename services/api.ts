/**
 * Cliente API MetalHub — todas las llamadas al backend.
 * Base URL desde EXPO_PUBLIC_API_URL (.env). Sesión en X-Session-Id.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_SESSION = '@metalhub_session_id';

const getBaseUrl = (): string => {
  return 'http://localhost:3000';
};

const getApiUrl = (path: string): string => {
  const base = getBaseUrl().replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
};

/** Obtener sessionId guardado (para cabecera X-Session-Id) */
export async function getSessionId(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_SESSION);
}

/** Guardar sessionId tras login */
export async function setSessionId(sessionId: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_SESSION, sessionId);
}

/** Borrar sesión (logout) */
export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_SESSION);
}

/** Cabeceras por defecto para peticiones autenticadas */
async function authHeaders(): Promise<Record<string, string>> {
  const sessionId = await getSessionId();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (sessionId) headers['X-Session-Id'] = sessionId;
  return headers;
}

/** Respuesta estándar del backend */
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  user?: { id: string; email: string; nombre: string; [k: string]: unknown };
  sessionId?: string;
};

/** Lanzar si la respuesta no es success (opcional) */
export function assertSuccess<T>(res: ApiResponse<T>): asserts res is ApiResponse<T> & { success: true } {
  if (!res.success) {
    const msg = res.message ?? res.error ?? 'Error en la petición';
    throw new Error(msg);
  }
}

// ——— Auth ———

export async function registerUser(email: string, password: string, nombre: string): Promise<ApiResponse> {
  const res = await fetch(getApiUrl('/api/v1/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nombre }),
  });
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<ApiResponse & { sessionId?: string }> {
  const res = await fetch(getApiUrl('/api/v1/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function logoutUser(): Promise<ApiResponse> {
  const headers = await authHeaders();
  const res = await fetch(getApiUrl('/api/v1/auth/logout'), { method: 'POST', headers });
  return res.json();
}

// ——— Users ———

/** Respuesta: { success, user } (user en raíz, no en data) */
export async function getMe(): Promise<ApiResponse & { user?: Record<string, unknown> }> {
  const headers = await authHeaders();
  const res = await fetch(getApiUrl('/api/v1/users/me'), { headers });
  return res.json();
}

export async function updateMe(body: { nombre?: string; bio?: string; ubicacion?: string; avatarUrl?: string }): Promise<ApiResponse> {
  const headers = await authHeaders();
  const res = await fetch(getApiUrl('/api/v1/users/me'), {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  return res.json();
}

// ——— Publicaciones ———

export type PublicacionListParams = {
  tipo?: 'todos' | 'compran' | 'venden';
  orden?: 'reciente' | 'precio_asc' | 'precio_desc' | 'volumen';
  busqueda?: string;
  metal?: string;
  ubicacion?: string;
  pagina?: number;
  limite?: number;
};

export type PublicacionItem = {
  id: string;
  tipo: 'vendo' | 'compro';
  metal: string;
  cantidad: number;
  unidad: string;
  precio?: number;
  precioAConvenir: boolean;
  descripcion?: string;
  entrega?: string;
  ubicacion?: string;
  usuario?: { id: string; nombre: string; rating?: number; ubicacion?: string; verificado?: boolean; whatsapp?: string };
  urgente?: boolean;
  creadoEn: string;
};

export type PublicacionesListResponse = ApiResponse<PublicacionItem[]> & { total?: number };

export async function getPublicaciones(params: PublicacionListParams = {}): Promise<PublicacionesListResponse> {
  const q = new URLSearchParams();
  if (params.tipo && params.tipo !== 'todos') q.set('tipo', params.tipo);
  if (params.orden) q.set('orden', params.orden === 'reciente' ? 'reciente' : params.orden === 'precio_asc' ? 'precio_asc' : params.orden === 'precio_desc' ? 'precio_desc' : params.orden === 'volumen' ? 'volumen' : 'reciente');
  if (params.busqueda) q.set('busqueda', params.busqueda);
  if (params.metal) q.set('metal', params.metal);
  if (params.ubicacion) q.set('ubicacion', params.ubicacion);
  if (params.pagina != null) q.set('pagina', String(params.pagina));
  if (params.limite != null) q.set('limite', String(params.limite));
  const url = getApiUrl('/api/v1/publicaciones') + (q.toString() ? `?${q.toString()}` : '');
  const res = await fetch(url);
  return res.json();
}

export async function getPublicacionById(id: string): Promise<ApiResponse<PublicacionItem> & { data?: PublicacionItem }> {
  const res = await fetch(getApiUrl(`/api/v1/publicaciones/${id}`));
  return res.json();
}

export async function getMisPublicaciones(params?: { pagina?: number; limite?: number }): Promise<PublicacionesListResponse> {
  const headers = await authHeaders();
  const q = new URLSearchParams();
  if (params?.pagina != null) q.set('pagina', String(params.pagina));
  if (params?.limite != null) q.set('limite', String(params.limite));
  const url = getApiUrl('/api/v1/publicaciones/mias') + (q.toString() ? `?${q.toString()}` : '');
  const res = await fetch(url, { headers });
  return res.json();
}

export type CreatePublicacionBody = {
  tipo: 'vendo' | 'compro';
  metal: string;
  cantidad: number;
  unidad: 'kg' | 'tn';
  precio?: number;
  precioAConvenir: boolean;
  descripcion?: string;
  entrega?: string;
  ubicacion?: string;
  urgente?: boolean;
};

export async function createPublicacion(body: CreatePublicacionBody): Promise<ApiResponse<PublicacionItem> & { data?: PublicacionItem }> {
  const headers = await authHeaders();
  const res = await fetch(getApiUrl('/api/v1/publicaciones'), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function updatePublicacion(id: string, body: Partial<CreatePublicacionBody>): Promise<ApiResponse<PublicacionItem> & { data?: PublicacionItem }> {
  const headers = await authHeaders();
  const res = await fetch(getApiUrl(`/api/v1/publicaciones/${id}`), {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function deletePublicacion(id: string): Promise<ApiResponse> {
  const headers = await authHeaders();
  const res = await fetch(getApiUrl(`/api/v1/publicaciones/${id}`), { method: 'DELETE', headers });
  return res.json();
}

// ——— Metales ———

export async function getMetales(): Promise<ApiResponse<{ id: string; nombre: string }[]>> {
  const res = await fetch(getApiUrl('/api/v1/metales'));
  const json = await res.json();
  if (json.success && Array.isArray(json.data)) return json;
  return { success: true, data: [] };
}

// ——— Suscripción ———

export async function getSuscripcion(): Promise<ApiResponse<{ activa: boolean; plan?: string; vencimiento?: string }>> {
  const headers = await authHeaders();
  const res = await fetch(getApiUrl('/api/v1/suscripcion'), { headers });
  return res.json();
}

// ——— Util: formatear fecha para lista ———

export function formatTimeAgo(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);
  if (diffM < 1) return 'Ahora';
  if (diffM < 60) return `Hace ${diffM}m`;
  if (diffH < 24) return `Hace ${diffH}h`;
  if (diffD < 7) return `Hace ${diffD}d`;
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}
