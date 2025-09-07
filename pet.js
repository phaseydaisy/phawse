document.addEventListener('DOMContentLoaded', () => {
    const cat = document.getElementById('cat');
    let isMoving = false;
    let isRunning = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    let lastMouseMove = Date.now();
    
    // Initial position
    cat.style.left = currentX + 'px';
    cat.style.top = currentY + 'px';

    // Mouse movement
    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        
        const now = Date.now();
        const timeSinceLastMove = now - lastMouseMove;
        lastMouseMove = now;
        
        const distance = Math.hypot(targetX - currentX, targetY - currentY);
        
        // Start animation based on mouse speed and distance
        if (distance > 50) {
            if (timeSinceLastMove < 50 && !isRunning && distance > 150) {
                isRunning = true;
                isMoving = false;
                cat.style.animation = 'cat-run 0.3s steps(4) infinite';
            } else if (!isMoving && !isRunning) {
                isMoving = true;
                cat.style.animation = 'cat-walk 0.5s steps(4) infinite';
            }
        } else {
            isMoving = false;
            isRunning = false;
            cat.style.animation = 'cat-idle 0.8s steps(4) infinite';
        }

        // Flip cat based on movement direction
        if (targetX < currentX) {
            cat.style.transform = 'scaleX(-1) scale(2)';
        } else {
            cat.style.transform = 'scaleX(1) scale(2)';
        }
    });

    // Smooth movement animation
    function animate() {
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        const distance = Math.hypot(dx, dy);
        
        if (distance > 1) {
            currentX += dx * 0.05;
            currentY += dy * 0.05;
            cat.style.left = (currentX - 20) + 'px';
            cat.style.top = (currentY - 20) + 'px';
        }
        
        requestAnimationFrame(animate);
    }
    animate();

    // Click interaction
    cat.addEventListener('click', () => {
        // Show heart
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '❤️';
        heart.style.left = (currentX) + 'px';
        heart.style.top = (currentY - 30) + 'px';
        document.body.appendChild(heart);
        
        setTimeout(() => {
            document.body.removeChild(heart);
        }, 1000);

        // Happy animation
        const currentAnimation = cat.style.animation;
        cat.style.animation = 'cat-happy 0.4s steps(4) infinite';
        setTimeout(() => {
            cat.style.animation = currentAnimation;
        }, 800);
    });
});
