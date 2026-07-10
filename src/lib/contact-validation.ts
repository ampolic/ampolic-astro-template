export interface Submission {
  name: string;
  email: string;
  message: string;
  website: string; // honeypot — must be empty
  startedAt: number; // ms epoch when the form was rendered/opened
}

export function validateSubmission(f: Submission, now: number): { ok: true } | { ok: false; reason: string } {
  if (f.website.trim() !== '') return { ok: false, reason: 'honeypot' };
  if (f.startedAt > 0 && now - f.startedAt < 3000) return { ok: false, reason: 'too-fast' };
  if (!f.name.trim() || !f.email.includes('@') || !f.message.trim()) return { ok: false, reason: 'incomplete' };
  return { ok: true };
}
