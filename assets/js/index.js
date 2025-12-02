 

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
