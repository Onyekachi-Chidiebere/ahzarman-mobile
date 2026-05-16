import { API_BASE_URL } from '../config';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type RequestOpts = RequestInit & { token?: string | null };

export async function apiRequest<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { token, headers: hdr, ...rest } = opts;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(hdr as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
  });

  const text = await res.text();
  let json: unknown = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {};
  }

  const obj = json as { success?: boolean; message?: string; data?: unknown };

  if (!res.ok) {
    const msg =
      (obj && typeof obj === 'object' && 'message' in obj && typeof obj.message === 'string'
        ? obj.message
        : null) || res.statusText;
    throw new ApiError(msg, res.status, json);
  }

  return json as T;
}

/** Throws when the server returns HTTP 200 with `{ success: false }`. */
export function assertApiSuccess<T extends { success?: boolean; message?: string }>(res: T): T {
  if (res && typeof res === 'object' && res.success === false) {
    throw new ApiError(res.message || 'Request failed', 200, res);
  }
  return res;
}
