/** Nigerian mobile → E.164 for Firebase Phone Auth (+234XXXXXXXXXX). */
export function toE164Ng(phone: string): string | null {
  const d = phone.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('0')) return `+234${d.slice(1)}`;
  if (d.length === 13 && d.startsWith('234')) return `+${d}`;
  if (d.length === 10 && /^[789]/.test(d)) return `+234${d}`;
  return null;
}

/** Display as +234 801 234 5678 (national number without leading 0). */
export function formatNgPhoneIntl(phone: string): string {
  const e164 = toE164Ng(phone);
  if (!e164) return phone.trim() || '—';
  const n = e164.slice(4); // 10 digits after +234
  return `+234 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}
