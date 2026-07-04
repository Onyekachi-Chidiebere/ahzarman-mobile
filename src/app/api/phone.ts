/** Nigerian mobile → E.164 for Firebase Phone Auth (+234XXXXXXXXXX). */
export function toE164Ng(phone: string): string | null {
  const d = phone.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('0')) return `+234${d.slice(1)}`;
  if (d.length === 13 && d.startsWith('234')) return `+${d}`;
  if (d.length === 10 && /^[789]/.test(d)) return `+234${d}`;
  return null;
}
