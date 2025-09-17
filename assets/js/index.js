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

function handleLinkClick(e) {
    const a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (!isInternalLink(a)) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    if (a.target && a.target !== '' && a.target !== '_self') return;

    e.preventDefault();
    const url = new URL(a.href, location.href);
    fetch(url.href, { credentials: 'same-origin' }).then(r => r.text()).then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const audioRoot = document.getElementById('phawse-audio-root');
        const newBody = doc.body;
        const preserve = audioRoot ? audioRoot : null;
        document.body.innerHTML = newBody.innerHTML;
        if (preserve) {
            if (!document.getElementById('phawse-audio-root')) document.body.appendChild(preserve);
        }
        history.pushState({}, '', url.href);
        const scripts = Array.from(document.body.querySelectorAll('script'));
        scripts.forEach(s => {
            const newScript = document.createElement('script');
            if (s.src) {
                newScript.src = s.src;
                newScript.async = false;
            } else {
                newScript.textContent = s.textContent;
            }
            document.body.appendChild(newScript);
            s.remove();
        });
        window.scrollTo(0,0);
    }).catch(err => {
        location.href = url.href;
    });
}

document.addEventListener('click', handleLinkClick);
const CONTENT_SELECTOR = '.portal-container';

function extractAndReplaceContent(doc) {
    const newContent = doc.querySelector(CONTENT_SELECTOR);
    const curContent = document.querySelector(CONTENT_SELECTOR);
    if (!newContent) return false;
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
    scripts.forEach(s => {
        const run = document.createElement('script');
        if (s.src) {
            run.src = s.src;
            run.async = false;
        } else {
            run.textContent = s.textContent;
        }
        s.remove();
        newContent.appendChild(run);
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

window.addEventListener('popstate', () => { location.reload(); });
