const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '1';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');
const particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.originalX = x;
        this.originalY = y;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.02;
        this.maxDistance = 50;
        this.color = Math.random() > 0.5 ? '#3498db' : '#2ecc71';
        this.alpha = Math.random() * 0.3 + 0.1;
    }

    update() {
        this.wobble += this.wobbleSpeed;
        this.x = this.originalX + Math.sin(this.wobble) * this.maxDistance;
        this.y = this.originalY + Math.cos(this.wobble) * this.maxDistance;
        this.originalX += this.speedX;
        this.originalY += this.speedY;
        if (this.originalX < 0 || this.originalX > canvas.width) this.speedX *= -1;
        if (this.originalY < 0 || this.originalY > canvas.height) this.speedY *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color.replace(')', `,${this.alpha})`);
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    resizeCanvas();
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        ));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvas);
init();
animate();
function isInternalLink(a) {
    if (!a || !a.href) return false;
    try {
        const url = new URL(a.href, location.href);
        return url.origin === location.origin;
    } catch (e) { return false; }
}

// single handleLinkClick implementation is attached below after helper functions
const CONTENT_SELECTOR = '.portal-container';

function extractAndReplaceContent(doc) {
    const newContent = doc.querySelector(CONTENT_SELECTOR);
    const curContent = document.querySelector(CONTENT_SELECTOR);
    if (!newContent) return false;
    // Ensure page-specific styles from the new document head are present in the current page.
    let styleLoadPromises = [];
    try {
        const headLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
        headLinks.forEach(link => {
            const href = link.href;
            if (!href) return;
            // If a stylesheet with the same href isn't already in the current head, append it and track its load.
            if (!document.head.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
                const nl = document.createElement('link');
                nl.rel = 'stylesheet';
                nl.href = href;
                if (link.crossOrigin) nl.crossOrigin = link.crossOrigin;
                const p = new Promise((resolve) => {
                    nl.addEventListener('load', () => resolve());
                    nl.addEventListener('error', () => resolve());
                    // In case load events never fire, resolve after a timeout
                    setTimeout(() => resolve(), 2500);
                });
                styleLoadPromises.push(p);
                document.head.appendChild(nl);
            }
        });
        // Also copy any inline <style> blocks that may be required by the page
        const headStyles = Array.from(doc.querySelectorAll('style'));
        headStyles.forEach(style => {
            const exists = Array.from(document.head.querySelectorAll('style')).some(s => s.textContent === style.textContent);
            if (!exists) document.head.appendChild(style.cloneNode(true));
        });
    } catch (e) {
        console.warn('Failed to import page head styles:', e);
    }

    const audioRoot = document.getElementById('phawse-audio-root');
    if (curContent) {
        curContent.replaceWith(newContent);
    } else {
        document.body.appendChild(newContent);
    }
    if (audioRoot && !document.getElementById('phawse-audio-root')) {
        document.body.appendChild(audioRoot);
    }

    // Re-run any scripts inside the replaced content so they execute in the current document.
    // For external scripts, avoid re-adding ones that already exist in the document to prevent double-loading.
    const scripts = Array.from(newContent.querySelectorAll('script'));
    const loadPromises = [];
    scripts.forEach(s => {
        const run = document.createElement('script');
        if (s.src) {
            // Always append external scripts found in the fetched content so page-specific logic executes.
            // Rely on per-script guards (like window.__phawseAudioControlInstalled) to avoid duplicates for globals.
            const srcHref = new URL(s.src, doc.baseURI).href;
            // Don't re-insert the main index.js to avoid double-initialization
            if (srcHref.endsWith('/assets/js/index.js') || srcHref.endsWith('/assets/js/index.js/')) {
                s.remove();
                return;
            }
            run.src = srcHref;
            run.async = false;
            // track load so we dispatch page-loaded only after external scripts executed
            loadPromises.push(new Promise((resolve) => {
                run.addEventListener('load', () => resolve());
                run.addEventListener('error', () => resolve());
            }));
        } else {
            // inline script: copy its text so it executes in the current document
            run.textContent = s.textContent;
        }
        s.remove();
        newContent.appendChild(run);
    });

    // Wait for both styles and scripts to settle before dispatching page-loaded
    Promise.all([].concat(styleLoadPromises, loadPromises)).then(() => {
        try {
            window.dispatchEvent(new CustomEvent('phawse:page-loaded', { detail: { url: location.href } }));
        } catch (e) {}

        // Defensive: call well-known initializers if present
        setTimeout(() => {
            try { if (typeof window.initContact === 'function') window.initContact(); } catch (e) {}
            try { if (typeof window.initHmph === 'function') window.initHmph(); } catch (e) {}
        }, 20);
    });

    return true;
}

function handleLinkClick(e) {
    const a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (!isInternalLink(a)) return; // let external links behave normally
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    if (a.target && a.target !== '' && a.target !== '_self') return;

    e.preventDefault();
    const url = new URL(a.href, location.href);
    fetch(url.href, { credentials: 'same-origin' }).then(r => r.text()).then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const replaced = extractAndReplaceContent(doc);
        if (!replaced) {
            location.href = url.href;
            return;
        }
        const newTitle = doc.querySelector('title');
        if (newTitle) document.title = newTitle.textContent;
        history.pushState({}, '', url.href);
        window.scrollTo(0,0);
    }).catch(err => {
        location.href = url.href;
    });
}

// Attach the click handler for internal navigation
document.addEventListener('click', handleLinkClick);

// Handle back/forward navigation via PJAX: fetch and swap content instead of full reload
window.addEventListener('popstate', (e) => {
    // Attempt to replace content for the current location.href
    const url = new URL(location.href);
    fetch(url.href, { credentials: 'same-origin' }).then(r => r.text()).then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const replaced = extractAndReplaceContent(doc);
        if (!replaced) {
            // fallback to full reload
            location.reload();
            return;
        }
        const newTitle = doc.querySelector('title');
        if (newTitle) document.title = newTitle.textContent;
        window.scrollTo(0,0);
    }).catch(() => {
        location.reload();
    });
});
