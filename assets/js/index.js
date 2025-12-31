 

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


window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});


document.querySelectorAll('.link-card').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.setProperty('--hover-x', '0');
    this.style.setProperty('--hover-y', '0');
  });
  
  card.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.style.setProperty('--hover-x', `${x}px`);
    this.style.setProperty('--hover-y', `${y}px`);
  });
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


document.querySelectorAll('.link-card').forEach(el => {
  observer.observe(el);
});




let ticking = false;

document.addEventListener('mousemove', (e) => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const orbs = document.querySelectorAll('.gradient-orb');
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      
      orbs.forEach((orb, index) => {
        const speed = (index + 1) * 10;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        
        orb.style.transform = `translate(${x}px, ${y}px)`;
      });
      
      ticking = false;
    });
    
    ticking = true;
  }
});

console.log('💖 Cute version loaded!');

// New Year's Fireworks
function createFireworks() {
  const canvas = document.createElement('canvas');
  canvas.id = 'fireworks-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  const colors = ['#ffc0d9', '#a0e7e5', '#d7c9ff', '#ffd700', '#ff6b9d', '#00d9ff'];
  
  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.velocity = {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8
      };
      this.alpha = 1;
      this.decay = Math.random() * 0.02 + 0.015;
      this.size = Math.random() * 3 + 2;
    }
    
    update() {
      this.velocity.x *= 0.98;
      this.velocity.y *= 0.98;
      this.velocity.y += 0.1;
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.alpha -= this.decay;
    }
    
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  
  function createExplosion(x, y) {
    const particleCount = 80;
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(x, y, color));
    }
  }
  
  function animate() {
    ctx.fillStyle = 'rgba(11, 15, 20, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      }
    }
    
    if (particles.length > 0) {
      requestAnimationFrame(animate);
    } else {
      setTimeout(() => {
        document.body.removeChild(canvas);
      }, 500);
    }
  }
  
  // Launch fireworks sequence
  const launchSequence = [
    { delay: 0, x: 0.2, y: 0.3 },
    { delay: 200, x: 0.8, y: 0.25 },
    { delay: 400, x: 0.5, y: 0.2 },
    { delay: 600, x: 0.3, y: 0.35 },
    { delay: 800, x: 0.7, y: 0.3 },
    { delay: 1000, x: 0.4, y: 0.25 },
    { delay: 1200, x: 0.6, y: 0.35 },
    { delay: 1400, x: 0.5, y: 0.3 }
  ];
  
  launchSequence.forEach(launch => {
    setTimeout(() => {
      createExplosion(
        canvas.width * launch.x,
        canvas.height * launch.y
      );
    }, launch.delay);
  });
  
  animate();
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Trigger fireworks on page load
window.addEventListener('load', () => {
  setTimeout(() => {
    createFireworks();
  }, 500);
});
