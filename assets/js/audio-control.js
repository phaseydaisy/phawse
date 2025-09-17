(function () {
  if (window.__phawseAudioControlInstalled) return;
  window.__phawseAudioControlInstalled = true;
  const container = document.createElement('div');
  container.id = 'phawse-audio-root';
  container.innerHTML = `
    <audio id="bg-audio" loop preload="auto">
      <source id="bg-audio-source" src="/assets/letugo.mp3" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
    <div id="volume-control" aria-label="Background music volume">
      <button id="vol-button" class="vol-btn" aria-label="Toggle volume control">🔈</button>
      <div id="vol-slider" class="vol-slider" aria-hidden="true">
        <input id="vol-range" type="range" min="0" max="1" step="0.01" value="0.08">
        <a id="open-spotify" href="https://open.spotify.com/track/40TZnaw4eDPChJNHw2Swf3" target="_blank" rel="noopener">Listen on Spotify</a>
      </div>
    </div>
  `;

  document.body.appendChild(container);
  const audio = document.getElementById('bg-audio');
  const volRange = document.getElementById('vol-range');
  const volButton = document.getElementById('vol-button');
  const volSliderWrap = document.getElementById('vol-slider');

  if (!audio) return;

  let saved = localStorage.getItem('phawse_shutdown_vol');
  let startVol = saved !== null ? parseFloat(saved) : 0.08;
  audio.volume = 0;

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

  audio.play().then(() => fadeVolume(0, startVol, 600)).catch(() => {});

  volButton.addEventListener('click', (e) => {
    const isVisible = volSliderWrap.classList.toggle('show');
    volSliderWrap.setAttribute('aria-hidden', !isVisible);
    if (!audio.paused && audio.volume > 0.001) {
      fadeVolume(audio.volume, 0, 300);
      volRange.value = 0;
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
    function onceStart() {
      if (audio.paused) {
        audio.play().then(() => fadeVolume(0, parseFloat(volRange.value || startVol), 400)).catch(() => {});
      }
      window.removeEventListener(ev, onceStart);
    }
    window.addEventListener(ev, onceStart);
  });
})();
