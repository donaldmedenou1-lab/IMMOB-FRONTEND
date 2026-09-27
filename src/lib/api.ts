export const API_BASE = import.meta.env.VITE_API_BASE || '/backend/api';

let csrfCache = '';

export function clearCsrfCache(): void {
  csrfCache = '';
}

export async function getCsrf(): Promise<string> {
  if (csrfCache) {
    return csrfCache;
  }

  const res = await fetch(`${API_BASE}/auth/csrf.php`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.csrf) {
    throw new Error(
      data.error || 'Session de sécurité indisponible.'
    );
  }

  csrfCache = data.csrf;

  return csrfCache;
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const cleanPath = path.replace(/^\/+/, '');

  async function sendRequest(): Promise<Response> {
    const headers = new Headers(options.headers || {});

    if (method !== 'GET' && method !== 'HEAD') {
      const csrf = await getCsrf();
      headers.set('X-CSRF-Token', csrf);
    }

    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers.has('Content-Type')
    ) {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(`${API_BASE}/${cleanPath}`, {
      ...options,
      headers,
      credentials: 'include',
      cache: 'no-store',
    });
  }

  // Première tentative
  let res = await sendRequest();

  // Si le token est invalide, on récupère un nouveau token
  // et on réessaie UNE SEULE FOIS.
  if (
    res.status === 419 &&
    method !== 'GET' &&
    method !== 'HEAD'
  ) {
    csrfCache = '';

    res = await sendRequest();
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 419) {
      csrfCache = '';
    }

    throw new Error(
      data.error || 'Une erreur est survenue.'
    );
  }

  // Si le backend fournit un nouveau token,
  // on utilise celui-ci pour les prochaines requêtes.
  if (data.csrf) {
    csrfCache = data.csrf;
  }

  return data as T;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
}