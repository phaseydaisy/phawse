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
const CONTENT_SELECTOR = '.portal-container';

const PHAWSE_PERSISTENT_HEAD_LINKS = new Set(Array.from(document.head.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href));
const PHAWSE_PERSISTENT_HEAD_STYLES = new Set(Array.from(document.head.querySelectorAll('style')).map(s => s.textContent));

function extractAndReplaceContent(doc) {
    const newContent = doc.querySelector(CONTENT_SELECTOR);
    const curContent = document.querySelector(CONTENT_SELECTOR);
    if (!newContent) return false;
    let styleLoadPromises = [];
    try {
        const headLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
        
        const desiredHrefs = headLinks.map(l => {
            try { return new URL(l.getAttribute('href') || l.href, doc.baseURI).href; } catch (e) { return null; }
        }).filter(Boolean);
        
        headLinks.forEach(link => {
            const hrefAbs = new URL(link.getAttribute('href') || link.href, doc.baseURI).href;
            if (!hrefAbs) return;
            if (!document.head.querySelector(`link[rel="stylesheet"][href="${hrefAbs}"]`)) {
                const nl = document.createElement('link');
                nl.rel = 'stylesheet';
                nl.href = hrefAbs;
                nl.dataset.phawseDynamic = '1';
                if (link.crossOrigin) nl.crossOrigin = link.crossOrigin;
                const p = new Promise((resolve) => {
                    nl.addEventListener('load', () => resolve());
                    nl.addEventListener('error', () => resolve());
                    setTimeout(() => resolve(), 2500);
                });
                styleLoadPromises.push(p);
                document.head.appendChild(nl);
            }
        });

        
        const headStyles = Array.from(doc.querySelectorAll('style'));
        headStyles.forEach(style => {
            const exists = Array.from(document.head.querySelectorAll('style')).some(s => s.textContent === style.textContent);
            if (!exists) {
                const cloned = style.cloneNode(true);
                cloned.dataset.phawseDynamic = '1';
                document.head.appendChild(cloned);
            }
        });

        
        try {
            const injectedLinks = Array.from(document.head.querySelectorAll('link[rel="stylesheet"][data-phawse-dynamic="1"]'));
            injectedLinks.forEach(l => {
                if (!desiredHrefs.includes(l.href) && !PHAWSE_PERSISTENT_HEAD_LINKS.has(l.href)) {
                    l.remove();
                }
            });
            const injectedStyles = Array.from(document.head.querySelectorAll('style[data-phawse-dynamic="1"]'));
            const desiredStyleContents = headStyles.map(s => s.textContent);
            injectedStyles.forEach(s => {
                if (!desiredStyleContents.includes(s.textContent) && !PHAWSE_PERSISTENT_HEAD_STYLES.has(s.textContent)) {
                    s.remove();
                }
            });
        } catch (e) {
        }
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

    
    const scripts = Array.from(newContent.querySelectorAll('script'));
    const loadPromises = [];
    scripts.forEach(s => {
        const run = document.createElement('script');
        if (s.src) {
            
            const srcHref = new URL(s.getAttribute('src') || s.src, doc.baseURI).href;
            
            if (srcHref.endsWith('/assets/js/index.js') || srcHref.endsWith('/assets/js/index.js/')) {
                s.remove();
                return;
            }
            run.src = srcHref;
            run.dataset.phawseDynamic = '1';
            run.async = false;
            
            loadPromises.push(new Promise((resolve) => {
                run.addEventListener('load', () => resolve());
                run.addEventListener('error', () => resolve());
            }));
        } else {
            
            run.textContent = s.textContent;
            run.dataset.phawseDynamic = '1';
        }
        s.remove();
        newContent.appendChild(run);
    });

    
    Promise.all([].concat(styleLoadPromises, loadPromises)).then(() => {
        try {
            window.dispatchEvent(new CustomEvent('phawse:page-loaded', { detail: { url: location.href } }));
        } catch (e) {}

        
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

document.addEventListener('click', handleLinkClick);

window.addEventListener('popstate', (e) => {
    
    const url = new URL(location.href);
    fetch(url.href, { credentials: 'same-origin' }).then(r => r.text()).then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const replaced = extractAndReplaceContent(doc);
        if (!replaced) {
            
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
