import { apiRequest } from './client';

export type UserProfile = {
  id: number;
  name: string;
  phone: string;
  email: string;
  username?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  wallet_balance?: string | number;
  profile_image?: string | null;
  phone_verified?: boolean;
  email_verified?: boolean;
};

type UserResponse = { success: boolean; message?: string; data: UserProfile };

export function formatPhoneDisplay(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('0')) {
    return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  return phone.trim() || '—';
}

export function formatDobDisplay(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Best-effort parse for edit input → ISO date string for API. */
export function parseDobForApi(input: string): string | null {
  const t = input.trim();
  if (!t || t === '—') return null;
  const parsed = new Date(t);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

export async function getUserById(userId: number, token: string | null) {
  const res = await apiRequest<UserResponse>(`/users/${userId}`, { method: 'GET', token });
  return res.data;
}

export async function updateUser(
  userId: number,
  token: string | null,
  body: Partial<Pick<UserProfile, 'name' | 'email' | 'username' | 'date_of_birth' | 'gender'>>,
) {
  const res = await apiRequest<UserResponse>(`/users/${userId}`, {
    method: 'PUT',
    token,
    body: JSON.stringify(body),
  });
  return res.data;
}
