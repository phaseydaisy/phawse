const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

const gridSize = 30;
const tileCount = canvas.width / gridSize;
let score = 0;

let snake = [
    { x: 5, y: 5, angle: 0 }
];
let food = { x: 10, y: 10 };
let dx = 0;
let dy = 0;
let speed = 8;
let gameLoop;
let lastRenderTime = 0;
let lastDirection = { dx: 0, dy: 0 };

function handleDirection(newDx, newDy) {
    if ((newDx === 0 && dy === 0) || (newDy === 0 && dx === 0)) {
        dx = newDx;
        dy = newDy;
        lastDirection = { dx: newDx, dy: newDy };
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
            handleDirection(0, -1);
            break;
        case 'arrowdown':
        case 's':
            handleDirection(0, 1);
            break;
        case 'arrowleft':
        case 'a':
            handleDirection(-1, 0);
            break;
        case 'arrowright':
        case 'd':
            handleDirection(1, 0);
            break;
    }
});

// Mobile controls
document.querySelectorAll('.control-btn').forEach(btn => {
    const handleTouch = () => {
        switch(btn.id) {
            case 'up':
                handleDirection(0, -1);
                break;
            case 'down':
                handleDirection(0, 1);
                break;
            case 'left':
                handleDirection(-1, 0);
                break;
            case 'right':
                handleDirection(1, 0);
                break;
        }
    };
    
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleTouch();
    });
    btn.addEventListener('mousedown', handleTouch);
});

function drawGame(currentTime) {
    if (lastRenderTime === 0) {
        lastRenderTime = currentTime;
    }

    const timeSinceLastRender = currentTime - lastRenderTime;
    window.requestAnimationFrame(drawGame);

    if (timeSinceLastRender < 1000 / speed) return;
    lastRenderTime = currentTime;

    const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, canvas.width/2
    );
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(76, 175, 80, 0.1)';
    ctx.lineWidth = 1;
    for(let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    const newHead = {
        x: snake[0].x + dx,
        y: snake[0].y + dy,
        angle: Math.atan2(dy, dx)
    };
    snake.unshift(newHead);

    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = `Score: ${score}`;
        generateFood();
        speed = Math.min(15, 8 + Math.floor(score / 50)); 
    } else {
        snake.pop();
    }

    snake.forEach((segment, index) => {
        ctx.save();
        ctx.translate(
            segment.x * gridSize + gridSize/2,
            segment.y * gridSize + gridSize/2
        );
        
        const segmentGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, gridSize/2);
        segmentGradient.addColorStop(0, '#4CAF50');
        segmentGradient.addColorStop(1, '#388E3C');
        
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = 10;
        ctx.fillStyle = segmentGradient;
        
        if (index === 0) { 
            ctx.rotate(segment.angle);
            ctx.beginPath();
            ctx.arc(0, 0, gridSize/2 - 2, 0, Math.PI * 2);
            ctx.fill();
        } else { 
            ctx.beginPath();
            ctx.arc(0, 0, (gridSize/2 - 2) * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    });

    const pulseSize = 1 + Math.sin(currentTime / 200) * 0.1;
    ctx.save();
    ctx.translate(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2
    );
    ctx.scale(pulseSize, pulseSize);
    
    const foodGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, gridSize/2);
    foodGradient.addColorStop(0, '#ff6b6b');
    foodGradient.addColorStop(1, '#ff0000');
    
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 15;
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(0, 0, gridSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (isGameOver()) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#4CAF50';
        ctx.shadowColor = '#4CAF50';
        ctx.shadowBlur = 10;
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 30);
        
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
        ctx.fillText('Press Space to Restart', canvas.width/2, canvas.height/2 + 60);
        
        document.addEventListener('keydown', function restart(e) {
            if (e.code === 'Space') {
                document.removeEventListener('keydown', restart);
                snake = [{ x: 5, y: 5, angle: 0 }];
                food = { x: 10, y: 10 };
                dx = 0;
                dy = 0;
                score = 0;
                speed = 8;
                document.getElementById('score').textContent = 'Score: 0';
                lastRenderTime = 0;
                window.requestAnimationFrame(drawGame);
            }
        });
        return;
    }
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    food = newFood;
}

function isGameOver() {
    if (snake[0].x < 0 || snake[0].x >= tileCount || 
        snake[0].y < 0 || snake[0].y >= tileCount) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    return false;
}

window.requestAnimationFrame(drawGame);
