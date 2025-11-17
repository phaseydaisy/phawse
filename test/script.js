// ========================================
// QUANTUM GALAXY EXPLORER
// Advanced Interactive 3D Particle System
// ========================================

class Particle {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.z = Math.random() * 1000;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.vz = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 3 + 1;
        this.canvas = canvas;
        this.hue = Math.random() * 360;
        this.brightness = Math.random() * 100;
        this.life = 1;
        this.angle = Math.random() * Math.PI * 2;
        this.distance = Math.random() * 300 + 100;
        this.orbitSpeed = (Math.random() - 0.5) * 0.02;
    }

    update(mode, centerX, centerY, gravity, speed, mouseX, mouseY, mouseDown) {
        switch(mode) {
            case 'orbit':
                this.orbitUpdate(centerX, centerY, speed);
                break;
            case 'explode':
                this.explodeUpdate(speed);
                break;
            case 'blackhole':
                this.blackholeUpdate(centerX, centerY, gravity, speed);
                break;
            case 'mouse':
                this.mouseUpdate(mouseX, mouseY, gravity, speed);
                break;
            case 'wave':
                this.waveUpdate(centerX, centerY, speed);
                break;
        }

        this.z += this.vz * speed;
        
        // Wrap around
        if (this.z < 0) this.z = 1000;
        if (this.z > 1000) this.z = 0;
    }

    orbitUpdate(centerX, centerY, speed) {
        this.angle += this.orbitSpeed * speed;
        this.x = centerX + Math.cos(this.angle) * this.distance;
        this.y = centerY + Math.sin(this.angle) * this.distance * 0.5;
        this.distance += Math.sin(this.angle * 3) * 0.5;
    }

    explodeUpdate(speed) {
        this.vx *= 1.01;
        this.vy *= 1.01;
        this.x += this.vx * speed;
        this.y += this.vy * speed;
        this.life -= 0.01;
    }

    blackholeUpdate(centerX, centerY, gravity, speed) {
        const dx = centerX - this.x;
        const dy = centerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = (gravity * 100) / (distance + 1);
        
        this.vx += (dx / distance) * force * speed;
        this.vy += (dy / distance) * force * speed;
        
        this.vx *= 0.99;
        this.vy *= 0.99;
        
        this.x += this.vx * speed;
        this.y += this.vy * speed;
    }

    mouseUpdate(mouseX, mouseY, gravity, speed) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = (gravity * 50) / (distance + 1);
        
        this.vx += (dx / distance) * force * speed;
        this.vy += (dy / distance) * force * speed;
        
        this.vx *= 0.95;
        this.vy *= 0.95;
        
        this.x += this.vx * speed;
        this.y += this.vy * speed;
    }

    waveUpdate(centerX, centerY, speed) {
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const wave = Math.sin(distance * 0.02 - Date.now() * 0.002) * 5;
        
        this.y += wave * speed;
        this.x += Math.cos(this.angle) * speed;
    }

    draw(ctx, colorMode, trails = false) {
        const scale = 1000 / (1000 - this.z);
        const x2d = this.x * scale;
        const y2d = this.y * scale;
        const size = this.size * scale;

        const alpha = trails ? 0.3 : 1;
        ctx.globalAlpha = alpha * this.life;

        const color = this.getColor(colorMode);
        
        // Glow effect
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, size * 3);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x2d, y2d, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
    }

    getColor(mode) {
        switch(mode) {
            case 'rainbow':
                return `hsl(${this.hue}, 100%, 60%)`;
            case 'fire':
                return `hsl(${this.hue % 60}, 100%, 50%)`;
            case 'ice':
                return `hsl(${180 + this.hue % 60}, 100%, 70%)`;
            case 'cosmic':
                return `hsl(${240 + this.hue % 120}, 80%, 60%)`;
            case 'neon':
                return `hsl(${this.hue}, 100%, 50%)`;
            case 'matrix':
                return `hsl(120, 100%, ${40 + this.brightness % 40}%)`;
            default:
                return `hsl(${this.hue}, 100%, 60%)`;
        }
    }
}

class GalaxyExplorer {
    constructor() {
        this.canvas = document.getElementById('galaxy-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.audioCanvas = document.getElementById('audio-canvas');
        this.audioCtx = this.audioCanvas.getContext('2d');
        
        this.particles = [];
        this.particleCount = 5000;
        this.mode = 'orbit';
        this.colorMode = 'cosmic';
        this.speed = 1;
        this.gravity = 0.5;
        this.isPaused = false;
        this.trails = false;
        this.showUI = true;
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;
        
        this.fps = 60;
        this.lastTime = Date.now();
        this.frames = 0;
        
        this.secretCode = '';
        this.secretTarget = 'QUANTUM';
        
        this.resize();
        this.init();
        this.setupEventListeners();
        this.setupAudio();
        this.animate();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 2000);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.audioCanvas.width = window.innerWidth;
        this.audioCanvas.height = 150;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 300 + 100;
            const x = this.centerX + Math.cos(angle) * distance;
            const y = this.centerY + Math.sin(angle) * distance * 0.5;
            this.particles.push(new Particle(x, y, this.canvas));
        }
    }

    setupEventListeners() {
        // Mouse events
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            // Update cursor
            const cursor = document.getElementById('cursor-effect');
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        window.addEventListener('mousedown', (e) => {
            this.mouseDown = true;
            this.mode = 'mouse';
        });

        window.addEventListener('mouseup', () => {
            this.mouseDown = false;
            if (this.mode === 'mouse') {
                this.mode = 'orbit';
            }
        });

        window.addEventListener('dblclick', (e) => {
            this.createBurst(e.clientX, e.clientY);
        });

        // Keyboard events
        window.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case ' ':
                    this.isPaused = !this.isPaused;
                    break;
                case 'r':
                    this.randomExplosion();
                    break;
                case 'b':
                    this.bigBang();
                    break;
                case 'h':
                    this.toggleUI();
                    break;
                default:
                    this.checkSecretCode(e.key.toUpperCase());
            }
        });

        // Wheel zoom
        window.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.particles.forEach(p => {
                p.z += e.deltaY * 0.5;
                p.z = Math.max(0, Math.min(1000, p.z));
            });
        }, { passive: false });

        // Window resize
        window.addEventListener('resize', () => {
            this.resize();
        });

        // Control panel
        document.getElementById('particle-count').addEventListener('input', (e) => {
            this.particleCount = parseInt(e.target.value);
            document.getElementById('particle-count-value').textContent = this.particleCount;
            this.init();
        });

        document.getElementById('speed').addEventListener('input', (e) => {
            this.speed = parseFloat(e.target.value);
            document.getElementById('speed-value').textContent = this.speed.toFixed(1) + 'x';
        });

        document.getElementById('gravity').addEventListener('input', (e) => {
            this.gravity = parseFloat(e.target.value);
            document.getElementById('gravity-value').textContent = this.gravity.toFixed(1);
        });

        document.getElementById('color-mode').addEventListener('change', (e) => {
            this.colorMode = e.target.value;
        });

        document.getElementById('explode-btn').addEventListener('click', () => {
            this.mode = 'explode';
            this.particles.forEach(p => p.life = 1);
            setTimeout(() => { this.mode = 'orbit'; this.init(); }, 3000);
        });

        document.getElementById('blackhole-btn').addEventListener('click', () => {
            this.mode = 'blackhole';
            document.getElementById('current-mode').textContent = 'Black Hole';
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.mode = 'orbit';
            this.init();
            document.getElementById('current-mode').textContent = 'Orbit';
        });

        document.getElementById('music-btn').addEventListener('click', () => {
            this.toggleMusic();
        });

        document.getElementById('trails-btn').addEventListener('click', () => {
            this.trails = !this.trails;
        });
    }

    setupAudio() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.musicPlaying = false;
    }

    toggleMusic() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            // Create oscillators for ambient music
            this.createAmbientMusic();
        }
        
        if (this.musicPlaying) {
            this.audioContext.suspend();
            this.musicPlaying = false;
        } else {
            this.audioContext.resume();
            this.musicPlaying = true;
        }
    }

    createAmbientMusic() {
        const notes = [261.63, 293.66, 329.63, 392.00, 440.00]; // C, D, E, G, A
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
            
            gain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
            
            osc.connect(gain);
            gain.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            
            osc.start();
            
            // Modulate frequency for ambient effect
            setInterval(() => {
                if (this.musicPlaying) {
                    osc.frequency.setValueAtTime(
                        freq * (1 + Math.sin(Date.now() * 0.001 + i) * 0.1),
                        this.audioContext.currentTime
                    );
                }
            }, 100);
        });
    }

    createBurst(x, y) {
        for (let i = 0; i < 100; i++) {
            const particle = new Particle(x, y, this.canvas);
            particle.vx = (Math.random() - 0.5) * 10;
            particle.vy = (Math.random() - 0.5) * 10;
            this.particles.push(particle);
        }
        
        // Remove old particles
        if (this.particles.length > this.particleCount + 100) {
            this.particles = this.particles.slice(-this.particleCount);
        }
    }

    randomExplosion() {
        this.particles.forEach(p => {
            p.hue = Math.random() * 360;
            p.vx = (Math.random() - 0.5) * 5;
            p.vy = (Math.random() - 0.5) * 5;
        });
        this.mode = 'explode';
        setTimeout(() => { this.mode = 'orbit'; }, 2000);
    }

    bigBang() {
        this.showEasterEgg('💥 BIG BANG! 💥');
        this.particles = [];
        
        // Create expanding sphere
        for (let i = 0; i < this.particleCount; i++) {
            const particle = new Particle(this.centerX, this.centerY, this.canvas);
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 15 + 5;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.hue = Math.random() * 360;
            this.particles.push(particle);
        }
        
        this.mode = 'explode';
        setTimeout(() => {
            this.mode = 'orbit';
            this.init();
        }, 4000);
    }

    toggleUI() {
        this.showUI = !this.showUI;
        const panels = document.querySelectorAll('.glass-panel');
        panels.forEach(panel => {
            panel.classList.toggle('hidden-ui');
        });
    }

    checkSecretCode(key) {
        this.secretCode += key;
        if (this.secretCode.length > this.secretTarget.length) {
            this.secretCode = this.secretCode.slice(-this.secretTarget.length);
        }
        
        if (this.secretCode === this.secretTarget) {
            this.activateQuantumMode();
            this.secretCode = '';
        }
    }

    activateQuantumMode() {
        this.showEasterEgg('🌟 QUANTUM MODE ACTIVATED! 🌟');
        
        // Rainbow color cycling
        let colorIndex = 0;
        const colors = ['rainbow', 'fire', 'ice', 'neon', 'matrix', 'cosmic'];
        
        const interval = setInterval(() => {
            this.colorMode = colors[colorIndex % colors.length];
            colorIndex++;
        }, 500);
        
        // Crazy mode
        this.mode = 'wave';
        this.speed = 2;
        
        setTimeout(() => {
            clearInterval(interval);
            this.mode = 'orbit';
            this.speed = 1;
            this.colorMode = 'cosmic';
        }, 10000);
    }

    showEasterEgg(message) {
        const eggMsg = document.getElementById('easter-egg-msg');
        eggMsg.textContent = message;
        eggMsg.classList.add('show');
        
        setTimeout(() => {
            eggMsg.classList.remove('show');
        }, 3000);
    }

    drawAudioVisualizer() {
        if (!this.analyser || !this.musicPlaying) {
            this.audioCtx.clearRect(0, 0, this.audioCanvas.width, this.audioCanvas.height);
            return;
        }

        this.analyser.getByteFrequencyData(this.dataArray);

        this.audioCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.audioCtx.fillRect(0, 0, this.audioCanvas.width, this.audioCanvas.height);

        const barWidth = (this.audioCanvas.width / this.dataArray.length) * 2.5;
        let x = 0;

        for (let i = 0; i < this.dataArray.length; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.audioCanvas.height;
            
            const hue = (i / this.dataArray.length) * 360;
            this.audioCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            
            this.audioCtx.fillRect(
                x,
                this.audioCanvas.height - barHeight,
                barWidth,
                barHeight
            );
            
            x += barWidth + 1;
        }
    }

    updateStats() {
        const now = Date.now();
        this.frames++;
        
        if (now - this.lastTime >= 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.lastTime = now;
            
            document.getElementById('fps').textContent = this.fps;
            document.getElementById('active-particles').textContent = this.particles.length;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.isPaused) return;

        // Clear with trail effect
        if (this.trails) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = 'rgb(0, 0, 0)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Update and draw particles
        this.particles.forEach((particle, index) => {
            particle.update(
                this.mode,
                this.centerX,
                this.centerY,
                this.gravity,
                this.speed,
                this.mouseX,
                this.mouseY,
                this.mouseDown
            );
            particle.draw(this.ctx, this.colorMode, this.trails);
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });

        // Draw center attractor
        if (this.mode === 'blackhole') {
            const gradient = this.ctx.createRadialGradient(
                this.centerX, this.centerY, 0,
                this.centerX, this.centerY, 50
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.5)');
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, 50, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.drawAudioVisualizer();
        this.updateStats();
    }
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new GalaxyExplorer();
});
