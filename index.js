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
