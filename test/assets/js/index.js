const canvas = document.createElement('canvas');

// Advanced particle system for background
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'particle-canvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.zIndex = '0';
            this.canvas.style.pointerEvents = 'none';
            document.body.insertBefore(this.canvas, document.body.firstChild);
        }
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        this.init();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        const particleCount = Math.min(100, Math.floor(window.innerWidth / 15));
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 20 // Red hues
            });
        }
    }
    
    animate() {
        this.ctx.fillStyle = 'rgba(10, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${p.hue}, 100%, 50%, ${p.opacity})`;
            this.ctx.fill();
            
            // Draw connections
            this.particles.slice(i + 1).forEach(p2 => {
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `hsla(0, 100%, 50%, ${0.15 * (1 - dist / 120)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize particle system
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
    
    // Button tilt effect
    const buttons = document.querySelectorAll('[data-tilt]');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            btn.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
    
    // Animated title effect
    const title = document.querySelector('.animated-title');
    if (title) {
        let scale = 1;
        let direction = 1;
        setInterval(() => {
            scale += direction * 0.002;
            if (scale >= 1.03 || scale <= 0.97) direction *= -1;
            title.style.transform = `scale(${scale})`;
        }, 50);
    }
    
    // Mouse trail effect
    const trail = [];
    const maxTrail = 20;
    
    document.addEventListener('mousemove', (e) => {
        trail.push({
            x: e.clientX,
            y: e.clientY,
            time: Date.now()
        });
        
        if (trail.length > maxTrail) trail.shift();
        
        trail.forEach((point, i) => {
            const age = Date.now() - point.time;
            if (age < 500) {
                const dot = document.createElement('div');
                dot.style.position = 'fixed';
                dot.style.left = point.x + 'px';
                dot.style.top = point.y + 'px';
                dot.style.width = '4px';
                dot.style.height = '4px';
                dot.style.borderRadius = '50%';
                dot.style.background = `rgba(255, 0, 0, ${1 - age / 500})`;
                dot.style.pointerEvents = 'none';
                dot.style.zIndex = '9999';
                dot.style.boxShadow = `0 0 ${10 - age / 50}px rgba(255, 0, 0, ${0.8 - age / 625})`;
                document.body.appendChild(dot);
                
                setTimeout(() => dot.remove(), 100);
            }
        });
    });
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
