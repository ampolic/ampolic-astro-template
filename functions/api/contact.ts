import { validateSubmission, type Submission } from '../../src/lib/contact-validation';

interface Env {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

export const onRequestPost: (ctx: { request: Request; env: Env }) => Promise<Response> = async ({ request, env }) => {
  const form = await request.formData();
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');

  const fail = (msg: string, status = 400) =>
    wantsJson
      ? new Response(JSON.stringify({ ok: false, error: msg }), { status, headers: { 'content-type': 'application/json' } })
      : new Response(`<h1>Could not send</h1><p>${msg}</p><a href="/contact">Back</a>`, { status, headers: { 'content-type': 'text/html' } });

  // A real browser submit always includes these hidden fields (even empty).
  // Blind bots that POST only name/email/message omit them entirely — reject closed.
  if (!form.has('website') || !form.has('startedAt')) return fail('Invalid submission.');

  const submission: Submission = {
    name: String(form.get('name') ?? ''),
    email: String(form.get('email') ?? ''),
    message: String(form.get('message') ?? ''),
    website: String(form.get('website') ?? ''),
    startedAt: Number(form.get('startedAt') ?? 0),
  };

  const basic = validateSubmission(submission, Date.now());
  if (!basic.ok) return fail('Your message could not be validated.');

  const token = String(form.get('cf-turnstile-response') ?? '');
  try {
    if (token) {
      const ip = request.headers.get('cf-connecting-ip') ?? '';
      if (!(await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip))) return fail('Verification failed.');
    }
    // No token → no-JS path: honeypot + timing already passed above.

    const sent = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL,
        reply_to: submission.email,
        subject: `Website enquiry from ${submission.name}`,
        text: `${submission.name} <${submission.email}>\n\n${submission.message}`,
      }),
    });
    if (!sent.ok) return fail('We could not send your message. Please call us.', 502);
  } catch {
    return fail('We could not send your message. Please try again or call us.', 502);
  }

  return wantsJson
    ? new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } })
    : new Response('<h1>Thank you</h1><p>We’ll be in touch shortly.</p><a href="/">Home</a>', { headers: { 'content-type': 'text/html' } });
};
