const hmphBtn = document.getElementById('hmphBtn');
const hmphTitle = document.getElementById('hmph-title');
const exampleText = document.getElementById('example');

const hmphPhrases = [
  '"hmph! i didn\'t wanna go anyway!" — probably tim',
  '"hmph! whatever, i\'m not even mad" — narrator: they were mad',
  '"hmph! fine, see if i care!" — they definitely care',
  '"hmph! i was leaving anyway!" — they weren\'t',
  '"hmph! your loss, not mine!" — it was their loss',
  '"hmph! i don\'t need this!" — they did',
  '"hmph! i\'m too good for this anyway!" — debatable',
  '"hmph! you\'ll regret this!" — no one regretted it'
];

let clickCount = 0;
let isAnimating = false;

hmphBtn.addEventListener('click', () => {
  if (isAnimating) return;
  
  isAnimating = true;
  clickCount++;
  
  hmphBtn.style.transform = 'scale(0.95)';
  setTimeout(() => {
    hmphBtn.style.transform = 'scale(1)';
  }, 100);
  
  hmphTitle.style.animation = 'none';
  setTimeout(() => {
    hmphTitle.style.animation = 'hmphBounce 0.5s ease';
  }, 10);
  
  exampleText.style.opacity = '0';
  
  setTimeout(() => {
    const randomPhrase = hmphPhrases[Math.floor(Math.random() * hmphPhrases.length)];
    exampleText.textContent = randomPhrase;
    exampleText.style.opacity = '1';
    if (clickCount % 5 === 0) {
      createHmphParticles();
    }
    
    isAnimating = false;
  }, 300);
});

function createHmphParticles() {
  const particles = ['😤', '💢', '😠', '😒', '🙄'];
  const container = document.querySelector('.hmph-wrap');
  
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.className = 'hmph-particle';
      particle.textContent = particles[Math.floor(Math.random() * particles.length)];
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 0.3 + 's';
      container.appendChild(particle);
      
      setTimeout(() => particle.remove(), 2000);
    }, i * 50);
  }
}

const card = document.querySelector('.cute-card');
card.addEventListener('mouseenter', () => {
  card.style.transform = 'translateY(-4px)';
});

card.addEventListener('mouseleave', () => {
  card.style.transform = 'translateY(0)';
});

let secretClickCount = 0;
hmphTitle.addEventListener('click', () => {
  secretClickCount++;
  if (secretClickCount === 10) {
    hmphTitle.textContent = '😊 okay fine, i\'m not really mad';
    setTimeout(() => {
      hmphTitle.textContent = '😤 hmph.';
      secretClickCount = 0;
    }, 2000);
  }
});
