import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequestPost } from '../functions/api/contact';

const env = { TURNSTILE_SECRET_KEY: 's', RESEND_API_KEY: 'r', CONTACT_TO_EMAIL: 'to@x.com', CONTACT_FROM_EMAIL: 'from@x.com' } as any;

function req(fields: Record<string, string>, accept = 'application/json') {
  const body = new FormData();
  Object.entries(fields).forEach(([k, v]) => body.set(k, v));
  return new Request('https://x/api/contact', { method: 'POST', body, headers: { accept } });
}

beforeEach(() => vi.restoreAllMocks());

describe('contact function', () => {
  it('rejects a filled honeypot without emailing', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const res = await onRequestPost({ request: req({ name: 'A', email: 'a@b.com', message: 'hi there', website: 'x', startedAt: '0' }), env });
    expect(res.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends via Resend on a valid no-token (no-JS) submission', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    const res = await onRequestPost({ request: req({ name: 'A', email: 'a@b.com', message: 'hi there', website: '', startedAt: '0' }), env });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('rejects when Turnstile verification fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: false }), { status: 200 }));
    const res = await onRequestPost({ request: req({ name: 'A', email: 'a@b.com', message: 'hi there', website: '', startedAt: '0', 'cf-turnstile-response': 'tok' }), env });
    expect(res.status).toBe(400);
  });

  it('rejects a blind bot that omits the hidden fields entirely, without emailing', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const res = await onRequestPost({ request: req({ name: 'A', email: 'a@b.com', message: 'hi there' }), env });
    expect(res.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns 502 without throwing when fetch rejects with a network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    const res = await onRequestPost({ request: req({ name: 'A', email: 'a@b.com', message: 'hi there', website: '', startedAt: '0' }), env });
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'We could not send your message. Please try again or call us.' });
  });

  it('sends via Resend after a successful Turnstile verification', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    const res = await onRequestPost({
      request: req({ name: 'A', email: 'a@b.com', message: 'hi there', website: '', startedAt: '0', 'cf-turnstile-response': 'tok' }),
      env,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
