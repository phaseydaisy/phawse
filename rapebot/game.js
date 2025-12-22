const CONFIG = {
    canvas: {
        width: 600,
        height: 600
    },
    grid: {
        size: 20,
        cols: 30,
        rows: 30
    },
    speed: {
        initial: 100,
        increment: 2
    },
    colors: {
        snake: '#00ff88',
        snakeHead: '#00ffaa',
        food: '#ff4444',
        grid: 'rgba(255, 255, 255, 0.05)'
    }
};

let gameState = {
    snake: [],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: { x: 0, y: 0 },
    score: 0,
    highScore: 0,
    gameLoop: null,
    speed: CONFIG.speed.initial,
    isPaused: false,
    isGameOver: false
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

canvas.width = CONFIG.canvas.width;
canvas.height = CONFIG.canvas.height;

function loadHighScore() {
    const saved = localStorage.getItem('snakeHighScore');
    gameState.highScore = saved ? parseInt(saved) : 0;
    highScoreElement.textContent = gameState.highScore;
}

function saveHighScore() {
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('snakeHighScore', gameState.highScore);
        highScoreElement.textContent = gameState.highScore;
    }
}
function initGame() {
    const centerX = Math.floor(CONFIG.grid.cols / 2);
    const centerY = Math.floor(CONFIG.grid.rows / 2);
    
    gameState.snake = [
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY },
        { x: centerX - 2, y: centerY }
    ];
    
    gameState.direction = { x: 1, y: 0 };
    gameState.nextDirection = { x: 1, y: 0 };
    gameState.score = 0;
    gameState.speed = CONFIG.speed.initial;
    gameState.isPaused = false;
    gameState.isGameOver = false;
    
    scoreElement.textContent = 0;
    spawnFood();
}

function spawnFood() {
    let newFood;
    let isOnSnake;
    
    do {
        isOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * CONFIG.grid.cols),
            y: Math.floor(Math.random() * CONFIG.grid.rows)
        };
        
        for (let segment of gameState.snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                isOnSnake = true;
                break;
            }
        }
    } while (isOnSnake);
    
    gameState.food = newFood;
}

function drawGrid() {
    ctx.strokeStyle = CONFIG.colors.grid;
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= CONFIG.grid.cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CONFIG.grid.size, 0);
        ctx.lineTo(i * CONFIG.grid.size, CONFIG.canvas.height);
        ctx.stroke();
    }
    
    for (let i = 0; i <= CONFIG.grid.rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CONFIG.grid.size);
        ctx.lineTo(CONFIG.canvas.width, i * CONFIG.grid.size);
        ctx.stroke();
    }
}

function drawSnake() {
    gameState.snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? CONFIG.colors.snakeHead : CONFIG.colors.snake;
        
        const x = segment.x * CONFIG.grid.size;
        const y = segment.y * CONFIG.grid.size;
        
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, CONFIG.grid.size - 2, CONFIG.grid.size - 2, 4);
        ctx.fill();
        
        if (index === 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = CONFIG.colors.snakeHead;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    });
}

function drawFood() {
    const x = gameState.food.x * CONFIG.grid.size;
    const y = gameState.food.y * CONFIG.grid.size;
    const pulseSize = Math.sin(Date.now() / 200) * 2;
    
    ctx.fillStyle = CONFIG.colors.food;
    ctx.shadowBlur = 20;
    ctx.shadowColor = CONFIG.colors.food;
    
    ctx.beginPath();
    ctx.arc(
        x + CONFIG.grid.size / 2,
        y + CONFIG.grid.size / 2,
        CONFIG.grid.size / 2 - 2 + pulseSize,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    ctx.shadowBlur = 0;
}
function update() {
    if (gameState.isPaused || gameState.isGameOver) return;
    
    // Update direction
    gameState.direction = { ...gameState.nextDirection };
    
    // Calculate new head position
    const head = gameState.snake[0];
    const newHead = {
        x: head.x + gameState.direction.x,
        y: head.y + gameState.direction.y
    };
    
    // Check wall collision
    if (newHead.x < 0 || newHead.x >= CONFIG.grid.cols ||
        newHead.y < 0 || newHead.y >= CONFIG.grid.rows) {
        endGame();
        return;
    }
    
    // Check self collision
    for (let segment of gameState.snake) {
        if (segment.x === newHead.x && segment.y === newHead.y) {
            endGame();
            return;
        }
    }
    
    // Add new head
    gameState.snake.unshift(newHead);
    
    // Check food collision
    if (newHead.x === gameState.food.x && newHead.y === gameState.food.y) {
        gameState.score += 10;
        scoreElement.textContent = gameState.score;
        spawnFood();
        
        // Increase speed slightly
        if (gameState.speed > 50) {
            gameState.speed -= CONFIG.speed.increment;
            clearInterval(gameState.gameLoop);
            gameState.gameLoop = setInterval(gameLoop, gameState.speed);
        }
    } else {
        // Remove tail
        gameState.snake.pop();
    }
}

// Render Game
function render() {
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    
    // Draw elements
    drawGrid();
    drawFood();
    drawSnake();
}

// Game Loop
function gameLoop() {
    update();
    render();
}

// Start Game
function startGame() {
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    initGame();
    render();
    
    gameState.gameLoop = setInterval(gameLoop, gameState.speed);
}

// End Game
function endGame() {
    gameState.isGameOver = true;
    clearInterval(gameState.gameLoop);
    
    saveHighScore();
    
    finalScoreElement.textContent = gameState.score;
    gameOverScreen.classList.remove('hidden');
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (gameState.isGameOver) return;
    
    const key = e.key.toLowerCase();
    
    // Prevent default arrow key scrolling
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
    }
    
    // Pause
    if (key === ' ') {
        gameState.isPaused = !gameState.isPaused;
        return;
    }
    
    // Direction controls
    if ((key === 'arrowup' || key === 'w') && gameState.direction.y === 0) {
        gameState.nextDirection = { x: 0, y: -1 };
    } else if ((key === 'arrowdown' || key === 's') && gameState.direction.y === 0) {
        gameState.nextDirection = { x: 0, y: 1 };
    } else if ((key === 'arrowleft' || key === 'a') && gameState.direction.x === 0) {
        gameState.nextDirection = { x: -1, y: 0 };
    } else if ((key === 'arrowright' || key === 'd') && gameState.direction.x === 0) {
        gameState.nextDirection = { x: 1, y: 0 };
    }
});

// Button Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Initialize
loadHighScore();
render();
