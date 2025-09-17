document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelector('.status-text').textContent = 'goodnight...';
    }, 2000);

    setTimeout(() => {
        document.querySelector('.status-text').textContent = 'see you soon...';
    }, 4000);
    const audio = document.getElementById('bg-audio');
    const volRange = document.getElementById('vol-range');
    const volButton = document.getElementById('vol-button');
    const volSliderWrap = document.getElementById('vol-slider');

    if (!audio) return;

    let saved = localStorage.getItem('phawse_shutdown_vol');
    let startVol = saved !== null ? parseFloat(saved) : 0.08;
    audio.volume = 0;
    const tryPlay = () => {
        audio.play().then(() => {
            fadeVolume(0, startVol, 600);
        }).catch(() => {
        });
    };

    // Fade utility
    function fadeVolume(from, to, duration) {
        const start = performance.now();
        function step(now) {
            const t = Math.min(1, (now - start) / duration);
            audio.volume = from + (to - from) * t;
            if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    volRange.value = startVol;
    tryPlay();
    volButton.addEventListener('click', (e) => {
        const isVisible = volSliderWrap.classList.toggle('show');
        volSliderWrap.setAttribute('aria-hidden', !isVisible);
        if (!audio.paused && audio.volume > 0) {
            // clicking button mutes/unmutes
            if (audio.volume > 0.001) {
                fadeVolume(audio.volume, 0, 300);
                volRange.value = 0;
            } else {
                const target = parseFloat(localStorage.getItem('phawse_shutdown_vol') || startVol);
                fadeVolume(0, target, 400);
                volRange.value = target;
            }
        } else {
            audio.play().then(() => fadeVolume(audio.volume, startVol, 400)).catch(() => {});
        }
    });
    let sliderTimeout;
    volRange.addEventListener('input', (e) => {
        const v = parseFloat(e.target.value);
        audio.volume = v;
        localStorage.setItem('phawse_shutdown_vol', v);
        volButton.textContent = v <= 0 ? '🔇' : (v < 0.4 ? '🔈' : (v < 0.8 ? '🔉' : '🔊'));
        clearTimeout(sliderTimeout);
        sliderTimeout = setTimeout(() => { volSliderWrap.classList.remove('show'); volSliderWrap.setAttribute('aria-hidden','true'); }, 2500);
    });
    ['click','mousemove','keydown','touchstart'].forEach(ev => {
        window.addEventListener(ev, function onceStart() {
            if (audio.paused) {
                audio.play().then(() => fadeVolume(0, parseFloat(volRange.value || startVol), 400)).catch(() => {});
            }
            window.removeEventListener(ev, onceStart);
        });
    });
});
