# Rullzsy_ — Portfolio

Portfolio pribadi, **100% offline** (font, CSS, JS, ikon, gambar semua lokal), dengan **form kontak serverless** di Vercel.

## Struktur

```
assets
 ├── library/          # gsap, lucide (bundle 8 ikon), tailwindcss (sumber build)
 ├── fonts/            # TTF lokal (Geist, Geist Mono, Inter)
 ├── css/style.css     # hasil build Tailwind + custom CSS (minified)
 ├── js/main.js        # semua JavaScript
 ├── svg/              # ikon stack
 └── img/background|project/
api/contact.js         # serverless function form kontak (Vercel)
```

## Build (diperlukan setelah ubah HTML/CSS atau ikon)

```bash
npm install
npm run build        # build CSS (tailwind) + bundle ikon (lucide)
```

Output: `assets/css/style.css` + `assets/library/lucide/lucide.min.js`.

## Form kontak (Resend)

Form mengirim POST ke `/api/contact` (Vercel serverless function), yang memvalidasi
input lalu mengirim email ke alamat `CONTACT_TO_EMAIL` (default: email pemilik
akun Resend) via [Resend](https://resend.com).

Perlindungan spam di `/api/contact.js`:
- **Honeypot** — field tersembunyi `website` yang hanya diisi bot.
- **Validasi server-side** — field wajib, format email, batas panjang (2–100 nama, dst).
- **Rate limit** — maks 3 pesan / 10 menit per IP.
- Input di-escape (anti email/HTML injection).

### Setup email

1. Daftar di [resend.com](https://resend.com) dan buat **API Key** (`https://resend.com/api-keys`).
2. Set environment variable di Vercel: `RESEND_API_KEY=re_...`.
3. **Catatan sandbox**: tanpa domain terverifikasi, Resend hanya mengizinkan
   kirim ke **email pemilik akun Resend** — itulah default `CONTACT_TO_EMAIL`.
   Untuk menerima pesan di alamat lain (mis. `rullzsy99@gmail.com`):
   - Verifikasi domain di https://resend.com/domains (tambah record DNS),
   - lalu set `CONTACT_TO_EMAIL=rullzsy99@gmail.com` dan
     `EMAIL_FROM=noreply@domainmu.com` di Vercel.
4. Opsional: `EMAIL_FROM` untuk alamat pengirim (default `message_portfolio@resend.dev`,
   hanya untuk tes — untuk produksi verifikasi domain dan pakai `noreply@domainmu`).

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Di [vercel.com/new](https://vercel.com/new), import repo tersebut.
   Vercel otomatis mendeteksi static site + folder `api/` (tidak perlu konfigurasi).
3. Set env var `RESEND_API_KEY` di **Project → Settings → Environment Variables**.
4. Deploy. Form kontak langsung jalan di `/api/contact`.

Uji lokal dengan [Vercel CLI](https://vercel.com/docs/cli):

```bash
npx vercel dev        # jalankan di http://localhost:3000 (termasuk /api/contact)
```
