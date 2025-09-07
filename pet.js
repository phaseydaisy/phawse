document.addEventListener('DOMContentLoaded', () => {
    const cat = document.getElementById('cat');
    let isMoving = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight / 2;
    
    // Initial position
    cat.style.left = currentX + 'px';
    cat.style.top = currentY + 'px';

    // Mouse movement
    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        
        const distance = Math.hypot(targetX - currentX, targetY - currentY);
        
        // Start walking animation if mouse is far enough
        if (distance > 100 && !isMoving) {
            isMoving = true;
            cat.style.animation = 'walk 0.8s infinite';
        } else if (distance < 100 && isMoving) {
            isMoving = false;
            cat.style.animation = 'idle 3s infinite';
        }

        // Flip cat based on movement direction
        if (targetX < currentX) {
            cat.style.transform = 'scale(-4, 4)';
        } else {
            cat.style.transform = 'scale(4)';
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
        cat.style.animation = 'happy 0.5s';
        setTimeout(() => {
            cat.style.animation = currentAnimation;
        }, 500);
    });
});
