# My Portfolio

Personal portfolio website — a **fully offline static site** (fonts, CSS, JS, and icons all bundled locally, zero runtime CDN) with a dark minimal design, GSAP scroll animations, and a spam-protected serverless contact form powered by Resend.

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![GSAP](https://img.shields.io/badge/GSAP-%2388CE02.svg?style=for-the-badge&logo=greensock&logoColor=white) ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

---

# Preview
![screenshot_1](https://i.imgur.com/drs7ghO.png)
![screenshot_2](https://i.imgur.com/X5WksbL.png)
![screenshot_3](https://i.imgur.com/8EAKpGZ.png)

---

## Features

- **100% Offline** — self-hosted fonts, compiled CSS, local JS, and SVG icons; no CDN at runtime
- **GSAP Animations** — hero intro timeline, parallax section backgrounds, staggered scroll reveals
- **Scroll Progress Bar** — thin top progress indicator synced to page scroll
- **Scrollspy Navigation** — active nav link highlights follow the visible section
- **SPA-style Page Switching** — Home / About / Projects / Contact swap without reloading
- **Morphing Mobile Menu** — hamburger-to-close toggle with staggered link entrance
- **Project Lightbox** — keyboard-navigable image preview (arrows + Escape)
- **Serverless Contact Form** — server-side validation, honeypot, and per-IP rate limiting
- **Tree-shaken Icons** — only the 8 Lucide icons actually used are bundled (3.6 KB)
- **Responsive** — dark, minimal layout that scales from mobile to desktop

## Tech Stack

- **Language:** HTML5, CSS3, Vanilla JavaScript
- **Styling:** Tailwind CSS (build-time, purged to used utilities only)
- **Animations:** GSAP + ScrollTrigger
- **Icons:** Lucide (custom 8-icon bundle via esbuild)
- **Fonts:** Geist, Geist Mono, Inter (self-hosted TTF)
- **Backend:** Vercel serverless function (`api/`)
- **Email:** Resend
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/)

### Installation

```bash
git clone https://github.com/jack404-official/My-Portfolio.git
cd portfolio
npm install
```

### Development

Serve the folder statically (VS Code Live Server, `python -m http.server`, etc.) or run the Vercel dev server to also test the API:

```bash
npx vercel dev
```

### Production Build

```bash
npm run build
```

Compiles Tailwind CSS into `assets/css/style.css` and bundles the Lucide icons into `assets/library/lucide/lucide.min.js`.

### Environment Variables

Copy `.env.example` to `.env` for local use, or set them in **Vercel → Project → Settings → Environment Variables**:

```
RESEND_API_KEY=re_...
CONTACT_TO_EMAIL=youremail@gmail.com
EMAIL_FROM=emailform@resend.dev
```

> **Sandbox note:** without a verified domain, Resend only allows sending to the account owner's email — that is the default `CONTACT_TO_EMAIL`. To receive messages at a personal address (e.g. `jack404.official@gmail.com`), verify a domain at [resend.com/domains](https://resend.com/domains), then set `CONTACT_TO_EMAIL` and `EMAIL_FROM=noreply@yourdomain.com`.

## Project Structure

```
.
├── index.html              # single-page markup
├── api/
│   └── contact.js          # serverless contact endpoint (Vercel)
├── assets/
│   ├── css/style.css       # compiled Tailwind + custom CSS (minified)
│   ├── js/main.js          # all site JavaScript
│   ├── library/
│   │   ├── gsap/           # vendored GSAP + ScrollTrigger
│   │   ├── lucide/         # bundled icon set (8 icons)
│   │   └── tailwindcss/    # tailwind.config.js + input.css (build source)
│   ├── fonts/              # self-hosted TTF fonts
│   ├── svg/                # tech-stack icons
│   ├── img/
│   │   ├── background/     # section background images
│   │   └── project/        # project screenshots
│   └── ico/fav.ico         # favicon
└── src/lucide-icons.js     # icon bundle entry point
```

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Copyright (C) 2026 Jack404 Official
