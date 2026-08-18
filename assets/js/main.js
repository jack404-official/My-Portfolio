/* Rullzsy portfolio — main.js */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Typing animation ─── */
const typingTarget = document.querySelector('.typing-prefix');
const heroRoles    = ['Web Developer & Computer Technician.', 'Always learning about technology.', 'Especially hardware & software.'];
let roleIndex = 0, charIndex = 0, deleting = false;

function typeHeroRole() {
    if (!typingTarget) return;
    const role = heroRoles[roleIndex];
    typingTarget.textContent = role.slice(0, charIndex);

    if (!deleting && charIndex < role.length) { charIndex++; setTimeout(typeHeroRole, 72); return; }
    if (!deleting) { setTimeout(() => { deleting = true; typeHeroRole(); }, 1700); return; }
    if (charIndex > 0) { charIndex--; setTimeout(typeHeroRole, 40); return; }
    deleting = false;
    roleIndex = (roleIndex + 1) % heroRoles.length;
    setTimeout(typeHeroRole, 350);
}
typeHeroRole();

/* ─── Hero intro timeline ─── */
if (!prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('#navbar',           { y: -30, opacity: 0, duration: .7 })
        .from('.hero-eyebrow',     { y: 10, opacity: 0, duration: .5 }, '-=.45')
        .to('.line-reveal > span', { y: 0, duration: .95, stagger: .12 }, '-=.3')
        .from('#heroCopy',         { y: 18, opacity: 0, duration: .65 }, '-=.45')
        .from('#heroButtons',      { y: 18, opacity: 0, duration: .65 }, '-=.4');

    /* Scroll progress bar */
    gsap.to('#scrollProgress', {
        scaleX: 1, ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: .3 }
    });

    /* Parallax — hero background (bg1) */
    gsap.to('.hero-image', {
        yPercent: 8, scale: 1.04, ease: 'none',
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true }
    });

    /* Parallax — about intro background (bg2) */
    gsap.to('.about-intro-bg', {
        yPercent: 10, scale: 1.06, ease: 'none',
        scrollTrigger: { trigger: '#about', start: 'top top', end: 'bottom top', scrub: true }
    });

    /* Parallax — section backgrounds (bg3 + bg4) */
    gsap.utils.toArray('.about-section').forEach((section) => {
        const bg = section.querySelector('.section-bg');
        if (!bg) return;
        gsap.to(bg, {
            yPercent: 8, scale: 1.12, ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true }
        });
    });

    /* Parallax — projects background */
    gsap.to('.projects-bg', {
        yPercent: 8, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: '#projects', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    /* Section reveals (below the hero) */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const items = Array.from(entry.target.querySelectorAll('.reveal'));
            if (!items.length) { revealObserver.unobserve(entry.target); return; }
            gsap.to(items, {
                y: 0,
                opacity: 1,
                duration: .7,
                stagger: .045,
                ease: 'power3.out',
                overwrite: true
            });

            revealObserver.unobserve(entry.target);
        });
    }, { threshold: .12 });

    document.querySelectorAll('section').forEach(section => revealObserver.observe(section));
} else {
    document.querySelectorAll('.reveal').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
    });
}

/* ─── Page switching (Home / About / Projects / Contact) — no reload ─── */
const pageHome = document.getElementById('page-home');
const pageAbout = document.getElementById('page-about');
const pageProjects = document.getElementById('page-projects');
const pageContact = document.getElementById('page-contact');
const allPages = [pageHome, pageAbout, pageProjects, pageContact];

function showPage(name) {
    const show = name === 'about' ? pageAbout : name === 'projects' ? pageProjects : name === 'contact' ? pageContact : pageHome;
    const hide = allPages.find(p => p !== show && !p.classList.contains('hidden'));

    if (!hide) return;

    hide.classList.add('hidden');
    show.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    updateActiveNav();

    /* Smooth page transition: fade + slide in */
    if (!prefersReducedMotion) {
        gsap.fromTo(show, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out' });
    }

    requestAnimationFrame(() => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
}

document.querySelectorAll('[data-page]').forEach((link) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showPage(link.dataset.page);
        closeMenu();
    });
});

/* ─── Scrollspy — highlight the active nav link ─── */
const navMap = { home: 'nav-home', about: 'nav-about', story: 'nav-about', languages: 'nav-about', projects: 'nav-projects', contact: 'nav-contact' };
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
    const aboutVisible = !pageAbout.classList.contains('hidden');
    const projectsVisible = !pageProjects.classList.contains('hidden');
    const contactVisible = !pageContact.classList.contains('hidden');
    const probe = window.scrollY + window.innerHeight * 0.4;

    let current = contactVisible ? 'contact' : projectsVisible ? 'projects' : aboutVisible ? 'about' : 'home';
    if (aboutVisible) {
        for (const id of ['about', 'story', 'languages']) {
            const el = document.getElementById(id);
            if (el && el.offsetTop <= probe) current = 'about';
        }
    }

    const activeId = navMap[current] || 'nav-home';
    navLinks.forEach(link => {
        const isActive = link.id === activeId;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

let spyTick = false;
window.addEventListener('scroll', () => {
    if (spyTick) return;
    spyTick = true;
    requestAnimationFrame(() => { updateActiveNav(); spyTick = false; });
}, { passive: true });
updateActiveNav();

/* ─── Navbar hide/show ─── */
let lastScroll = 0;
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    const cur = window.scrollY;
    navbar.style.transform = (cur > 100 && cur > lastScroll) ? 'translateY(-100%)' : 'translateY(0)';
    lastScroll = cur;
}, { passive: true });

/* ─── Mobile menu ─── */
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const menuLinks = mobileMenu.querySelectorAll('.menu-link');

function openMenu() {
    menuBtn.classList.add('open');
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close menu');
    mobileMenu.classList.remove('menu-closed');
    document.body.style.overflow = 'hidden';

    if (!prefersReducedMotion) {
        gsap.fromTo(Array.from(menuLinks),
            { y: 36, opacity: 0 },
            { y: 0, opacity: 1, duration: .55, stagger: .08, ease: 'power3.out' });
        gsap.fromTo(mobileMenu.querySelector('.menu-socials'),
            { y: 16, opacity: 0 },
            { y: 0, opacity: 1, duration: .5, delay: .3, ease: 'power3.out' });
    }
}

function closeMenu() {
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    mobileMenu.classList.add('menu-closed');
    document.body.style.overflow = '';
}

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.contains('menu-closed') ? openMenu() : closeMenu();
});

menuLinks.forEach(link => link.addEventListener('click', () => closeMenu()));

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('menu-closed')) closeMenu();
});

window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeMenu();
});

/* ─── Contact form (kirim ke serverless /api/contact) ─── */
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateContact(p) {
    if (!p.firstName || p.firstName.length < 2 || p.firstName.length > 100) return 'Please enter your first name (2–100 characters).';
    if (!p.lastName || p.lastName.length < 2 || p.lastName.length > 100) return 'Please enter your last name (2–100 characters).';
    if (!p.email || p.email.length > 254) return 'Please enter a valid email address.';
    if (!EMAIL_RE.test(p.email)) return 'Please enter a valid email address.';
    if (!p.subject || p.subject.length > 200) return 'Please enter a subject (max 200 characters).';
    if (!p.message || p.message.length < 10) return 'Please write a message of at least 10 characters.';
    if (p.message.length > 5000) return 'Your message is too long (max 5000 characters).';
    return null;
}

function showFormNote(message, isError) {
    formNote.textContent = message;
    formNote.classList.toggle('error', !!isError);
    formNote.classList.add('show');
}

if (contactForm) {
    const submitBtn = contactForm.querySelector('.form-submit');
    const btnLabel = submitBtn.querySelector('.btn-label');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Honeypot — field tersembunyi yang hanya diisi bot: pura-pura sukses
        if (contactForm.querySelector('[name="website"]')?.value) {
            showFormNote('Message sent! Thanks for reaching out.');
            contactForm.reset();
            return;
        }

        const fd = new FormData(contactForm);
        const payload = {
            firstName: (fd.get('firstName') || '').trim(),
            lastName: (fd.get('lastName') || '').trim(),
            email: (fd.get('email') || '').trim(),
            subject: (fd.get('subject') || '').trim(),
            message: (fd.get('message') || '').trim()
        };

        const clientError = validateContact(payload);
        if (clientError) {
            showFormNote(clientError, true);
            return;
        }

        submitBtn.disabled = true;
        btnLabel.textContent = 'Sending…';

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                showFormNote(`Message sent! Thanks for reaching out, ${payload.firstName}.`);
                contactForm.reset();
            } else if (res.status === 429) {
                showFormNote('Too many messages — please try again in a few minutes.', true);
            } else {
                showFormNote(data.error || 'Something went wrong. Please try again.', true);
            }
        } catch (err) {
            showFormNote('Network error — could not send. Please try again.', true);
        } finally {
            submitBtn.disabled = false;
            btnLabel.textContent = 'Send Message';
        }
    });
}

/* ─── Lightbox (project preview) ─── */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCounter = document.getElementById('lightboxCounter');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxClose = document.getElementById('lightboxClose');

let lightboxList = [];
let lightboxIndex = 0;

function renderLightbox() {
    lightboxImg.src = lightboxList[lightboxIndex];
    lightboxCounter.textContent =
        `${String(lightboxIndex + 1).padStart(2, '0')} / ${String(lightboxList.length).padStart(2, '0')}`;
}

function openLightbox(list, index) {
    lightboxList = list;
    lightboxIndex = index;
    renderLightbox();
    lightbox.classList.remove('hidden');
    lightbox.style.display = '';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.add('hidden');
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
}

document.querySelectorAll('.project-media').forEach((media) => {
    const shots = media.querySelectorAll('.project-shot img');            const list = Array.from(shots).map(img => img.currentSrc || img.src || img.getAttribute('src'));
    if (!list.length) return;

    shots.forEach((img, i) => {
        img.closest('.project-shot').addEventListener('click', () => {
            if (prefersReducedMotion) { openLightbox(list, i); return; }
            gsap.fromTo(lightbox,
                { opacity: 0 },
                { opacity: 1, duration: .35, ease: 'power2.out', onStart: () => openLightbox(list, i) });
        });
    });
});

lightboxPrev.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + lightboxList.length) % lightboxList.length;
    renderLightbox();
});
lightboxNext.addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % lightboxList.length;
    renderLightbox();
});
lightboxClose.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev.click();
    if (e.key === 'ArrowRight') lightboxNext.click();
});

/* ─── Magnetic buttons ─── */
document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width/2)*.12, y: (e.clientY - r.top - r.height/2)*.12, duration:.25, ease:'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x:0, y:0, duration:.45, ease:'elastic.out(1,.45)' });
    });
});

/* ─── Cursor glow ─── */
const glow = document.getElementById('cursorGlow');
if (glow && window.matchMedia('(pointer: fine)').matches) {
    const glowX = gsap.quickTo(glow, 'x', { duration: .6, ease: 'power3.out' });
    const glowY = gsap.quickTo(glow, 'y', { duration: .6, ease: 'power3.out' });
    let glowVisible = false;
    window.addEventListener('mousemove', (e) => {
        if (!glowVisible) { glowVisible = true; gsap.to(glow, { opacity: 1, duration: .4 }); }
        glowX(e.clientX - 280);
        glowY(e.clientY - 280);
    });
}
