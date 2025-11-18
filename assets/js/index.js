const canvas = document.createElement('canvas');

// Mouse Particle Trail System
const particles = [];
const maxParticles = 100;

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = `hsl(${Math.random() * 60 + 240}, 100%, ${Math.random() * 30 + 60}%)`;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.size *= 0.98;
    }
}

function createParticle(x, y) {
    if (particles.length < maxParticles) {
        particles.push(new Particle(x, y));
    }
}

function animateParticles() {
    const particleContainer = document.querySelector('.particle-container');
    
    particles.forEach((particle, index) => {
        particle.update();
        
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
    
    if (particleContainer) {
        particleContainer.innerHTML = '';
        particles.forEach(particle => {
            const particleEl = document.createElement('div');
            particleEl.className = 'particle';
            particleEl.style.left = particle.x + 'px';
            particleEl.style.top = particle.y + 'px';
            particleEl.style.width = particle.size + 'px';
            particleEl.style.height = particle.size + 'px';
            particleEl.style.background = particle.color;
            particleEl.style.opacity = particle.life;
            particleContainer.appendChild(particleEl);
        });
    }
    
    requestAnimationFrame(animateParticles);
}

document.addEventListener('DOMContentLoaded', () => {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    document.body.appendChild(particleContainer);
    animateParticles();
});

document.addEventListener('mousemove', (e) => {
    for (let i = 0; i < 2; i++) {
        createParticle(e.clientX, e.clientY);
    }
});

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
