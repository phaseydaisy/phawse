// Path validation and iframe protection
const getBasePath = () => {
    const isGitHubPages = location.hostname.endsWith('github.io');
    if (isGitHubPages) {
        return '/phawse';
    }
    return '';
};

const basePath = getBasePath();

// Prevent iframe embedding
if (window.top !== window.self) {
    window.top.location.href = window.self.location.href;
}

// Valid paths for the site
const validPaths = [
    '/',
    '/index.html',
    '/contact/',
    '/contact/index.html',
    '/hmph/',
    '/hmph/index.html',
    '/404/',
    '/404/index.html',
    '/rapebot/',
    '/rapebot/index.html'
].map(path => basePath + path);

const currentPath = window.location.pathname;
if (!validPaths.includes(currentPath) && !currentPath.includes('/404/') && !currentPath.includes('/rapebot/')) {
    window.location.href = basePath + '/404/';
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = 'none';
    } else {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.5)';
    }
    
    lastScroll = currentScroll;
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .command-card, .api-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

let particles = [];
const maxParticles = 50;

document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.95) {
        createParticle(e.clientX, e.clientY);
    }
});

function createParticle(x, y) {
    if (particles.length >= maxParticles) {
        const oldParticle = particles.shift();
        oldParticle.remove();
    }
    
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.borderRadius = '50%';
    particle.style.background = 'var(--primary-color)';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    particle.style.opacity = '0.6';
    particle.style.transition = 'all 1s ease';
    
    document.body.appendChild(particle);
    particles.push(particle);
    
    setTimeout(() => {
        particle.style.opacity = '0';
        particle.style.transform = `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0)`;
    }, 10);
    
    setTimeout(() => {
        particle.remove();
        particles = particles.filter(p => p !== particle);
    }, 1000);
}

document.querySelectorAll('.command-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.background = 'var(--hover-bg)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.background = 'var(--card-bg)';
    });
});

document.querySelectorAll('code').forEach(codeBlock => {
    codeBlock.style.cursor = 'pointer';
    codeBlock.title = 'Click to copy';
    
    codeBlock.addEventListener('click', function() {
        const text = this.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            this.style.background = 'rgba(76, 175, 80, 0.2)';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = 'var(--dark-bg)';
            }, 1500);
        });
    });
});

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value >= 1000 ? (value / 1000).toFixed(1) + 'K+' : value + '+';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            if (statNumbers[0]) animateValue(statNumbers[0], 0, 1000, 2000);
            if (statNumbers[1]) animateValue(statNumbers[1], 0, 10000, 2000);
            if (statNumbers[2]) animateValue(statNumbers[2], 0, 3, 2000);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

console.log('%c🔥 NSFW Bot Website Loaded!', 'color: #ff1744; font-size: 20px; font-weight: bold;');
console.log('%cMade with ❤️ and 🔥', 'color: #9c27b0; font-size: 14px;');
