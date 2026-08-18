// ─────────────────────────────────────────────────────────────────────────
//  Contact form endpoint — Vercel serverless function
//  Menerima submission form kontak, memvalidasi, dan mengirim email
//  ke pemilik situs (rullzsy99@gmail.com) via Resend.
//
//  Env vars (set di Vercel → Project → Settings → Environment Variables):
//    RESEND_API_KEY  (wajib)  — buat di https://resend.com/api-keys
//    EMAIL_FROM      (opsional) — alamat pengirim; default "onboarding@resend.dev"
//
//  Perlindungan spam:
//    1. Honeypot  — field tersembunyi "website" yang hanya diisi bot.
//    2. Validasi ketat server-side — field wajib, format email, batas panjang.
//    3. Rate limit per-IP — maks 3 pesan / 10 menit per pengunjung.
// ─────────────────────────────────────────────────────────────────────────

const TO_EMAIL = 'rullzsy99@gmail.com';
const RESEND_URL = 'https://api.resend.com/emails';

const LIMITS = {
    name: { max: 100 },
    email: { max: 254 },
    subject: { max: 200 },
    message: { min: 10, max: 5000 }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Rate limiter sederhana (in-memory). Catatan: memori serverless bisa hilang
// saat cold start — untuk skala besar pakai Vercel KV / Upstash.
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map();

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getClientIp(req) {
    const fwd = req.headers['x-forwarded-for'];
    if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
    const real = req.headers['x-real-ip'];
    return typeof real === 'string' && real.length ? real : 'unknown';
}

function isRateLimited(ip) {
    const now = Date.now();
    const hit = hits.get(ip);
    if (!hit || now - hit.t > RATE_WINDOW_MS) {
        hits.set(ip, { count: 1, t: now });
        return false;
    }
    hit.count += 1;
    return hit.count > RATE_LIMIT;
}

function validate(body) {
    const errors = [];
    const s = (v) => (typeof v === 'string' ? v.trim() : '');

    const firstName = s(body.firstName);
    const lastName = s(body.lastName);
    const email = s(body.email);
    const subject = s(body.subject);
    const message = s(body.message);

    if (!firstName || firstName.length < 2) errors.push('First name is required (min 2 characters).');
    else if (firstName.length > LIMITS.name.max) errors.push(`First name must be under ${LIMITS.name.max} characters.`);

    if (!lastName || lastName.length < 2) errors.push('Last name is required (min 2 characters).');
    else if (lastName.length > LIMITS.name.max) errors.push(`Last name must be under ${LIMITS.name.max} characters.`);

    if (!email) errors.push('Email is required.');
    else if (email.length > LIMITS.email.max) errors.push('Email is too long.');
    else if (!EMAIL_RE.test(email)) errors.push('Please enter a valid email address.');

    if (!subject) errors.push('Subject is required.');
    else if (subject.length > LIMITS.subject.max) errors.push(`Subject must be under ${LIMITS.subject.max} characters.`);

    if (!message) errors.push('Message is required.');
    else if (message.length < LIMITS.message.min) errors.push(`Message must be at least ${LIMITS.message.min} characters.`);
    else if (message.length > LIMITS.message.max) errors.push(`Message must be under ${LIMITS.message.max} characters.`);

    return { errors, data: { firstName, lastName, email, subject, message } };
}

function sendJson(res, status, payload) {
    res.status(status).setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return sendJson(res, 405, { error: 'Method not allowed.' });
    }

    // Honeypot — bot yang mengisi field tersembunyi dianggap sukses (tanpa kirim email)
    const rawBody = req.body || {};
    const honey = rawBody.website || req.body?.website;
    if (honey) {
        return sendJson(res, 200, { ok: true, ignored: true });
    }

    // Validasi dulu (tidak menghabiskan kuota rate limit — pengguna boleh perbaiki typo)
    const { errors, data } = validate(rawBody);
    if (errors.length) {
        return sendJson(res, 400, { error: errors.join(' ') });
    }

    // Rate limit per IP — hanya menghitung request valid yang akan mengirim email
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
        return sendJson(res, 429, { error: 'Too many messages. Please try again in a few minutes.' });
    }

    if (!process.env.RESEND_API_KEY) {
        console.error('[contact] RESEND_API_KEY is not set.');
        return sendJson(res, 500, { error: 'Server email is not configured.' });
    }

    const subject = `[Portfolio] ${data.subject}`.slice(0, 240);
    const from = process.env.EMAIL_FROM || 'message_portfolio@resend.dev';

    const html =
        `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111">` +
        `<h2 style="margin:0 0 16px">New message from the portfolio contact form</h2>` +
        `<p><strong>Name:</strong> ${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}</p>` +
        `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>` +
        `<p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>` +
        `<hr style="border:none;border-top:1px solid #ddd;margin:16px 0">` +
        `<p style="white-space:pre-line">${escapeHtml(data.message)}</p>` +
        `</div>`;

    const text =
        `New message from the portfolio contact form\n\n` +
        `Name: ${data.firstName} ${data.lastName}\n` +
        `Email: ${data.email}\n` +
        `Subject: ${data.subject}\n\n` +
        `${data.message}`;

    try {
        const response = await fetch(RESEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from,
                to: [TO_EMAIL],
                reply_to: data.email,
                subject,
                html,
                text
            })
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            console.error('[contact] Resend error:', response.status, result);
            return sendJson(res, 502, { error: 'Email service rejected the message.' });
        }

        return sendJson(res, 200, { ok: true });
    } catch (err) {
        console.error('[contact] Unexpected error:', err);
        return sendJson(res, 500, { error: 'Something went wrong. Please try again later.' });
    }
};
