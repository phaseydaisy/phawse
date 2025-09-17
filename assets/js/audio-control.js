(function () {
  if (window.__phawseAudioControlInstalled) return;
  window.__phawseAudioControlInstalled = true;

  const songs = [
    { path: '/assets/music/letugo.mp3', title: 'Let U Go' }
  ];
  const randomSong = songs[Math.floor(Math.random() * songs.length)];
  
  const container = document.createElement('div');
  container.id = 'phawse-audio-root';
  container.innerHTML = `
    <audio id="bg-audio" loop preload="auto">
      <source id="bg-audio-source" src="${randomSong.path}" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
    <div id="volume-control" aria-label="Background music volume">
      <div class="audio-card enter" role="region" aria-label="background audio control">
        <button id="play-pause" class="vol-btn" aria-label="Play/Pause">⏵</button>
        <div class="vol-meta">
          <div class="vol-title">${randomSong.title}</div>
          <div class="vol-sub">background music</div>
        </div>
        <div class="visual-bars" aria-hidden="true">
          <div style="height:10%"></div>
          <div style="height:40%"></div>
          <div style="height:65%"></div>
          <div style="height:30%"></div>
        </div>
        <div class="vol-actions">
          <button id="expand-btn" class="expand-btn" aria-label="Open volume control">⚙️</button>
        </div>
        <div class="vol-slider" id="vol-slider" aria-hidden="true">
          <input id="vol-range" type="range" min="0" max="100" step="1" value="55">
          <a id="open-spotify" href="https://open.spotify.com/track/40TZnaw4eDPChJNHw2Swf3" target="_blank" rel="noopener">Spotify</a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);
  const audio = document.getElementById('bg-audio');
  const volRange = document.getElementById('vol-range');
  const playPauseBtn = document.getElementById('play-pause');
  const expandBtn = document.getElementById('expand-btn');
  const volSliderWrap = document.getElementById('vol-slider');

  if (!audio) return;

  const VOL_KEY = 'phawse_audio_vol';
  const TIME_KEY = 'phawse_audio_time';
  const PLAY_KEY = 'phawse_audio_playing';

  let saved = localStorage.getItem(VOL_KEY);
  let startVol = saved !== null ? (parseFloat(saved) > 1 ? parseFloat(saved) : Math.round(parseFloat(saved) * 100)) : 55;
  audio.volume = 0;

  function fadeVolume(from, to, duration) {
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      audio.volume = (from + (to - from) * t) / 100;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  volRange.value = startVol;
  volRange.style.setProperty('--percent', `${startVol}%`);
  const bars = container.querySelectorAll('.visual-bars div');
  function updateBars(vol){
    const base = Math.max(6, vol);
    bars.forEach((b,i)=>{
      const variance = [0.4,1.0,1.4,0.8][i] || 1;
      b.style.height = Math.max(8, Math.round(base * variance)) + '%';
    });
  }
  function resumeFromStorage() {
    const savedTime = parseFloat(localStorage.getItem(TIME_KEY) || 0);
    const wasPlaying = localStorage.getItem(PLAY_KEY) === '1';
    function trySetTime() {
      if (isFinite(savedTime) && savedTime > 0 && audio.duration && savedTime < audio.duration) {
        try { audio.currentTime = savedTime; } catch (e) {}
      }
      if (wasPlaying) {
        audio.play().then(() => {
          fadeVolume(0, startVol, 500);
          container.querySelector('.audio-card').classList.add('playing');
          playPauseBtn.textContent = '⏸';
          updateBars(startVol);
        }).catch(() => {
          playPauseBtn.textContent = '⏵';
        });
      } else {
        audio.volume = startVol;
        updateBars(startVol);
        playPauseBtn.textContent = '⏵';
      }
    }
    if (audio.readyState >= 1 && audio.duration) trySetTime();
    else audio.addEventListener('loadedmetadata', trySetTime, { once: true });
  }

  resumeFromStorage();
  let saveTimer = setInterval(() => {
    if (!isNaN(audio.currentTime) && audio.duration) {
      localStorage.setItem(TIME_KEY, String(audio.currentTime));
    }
  }, 1000);
  playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        fadeVolume(audio.volume, Math.max(0.01, startVol), 300);
        container.querySelector('.audio-card').classList.add('playing');
        playPauseBtn.textContent = '⏸';
        localStorage.setItem(PLAY_KEY, '1');
      }).catch(() => {});
    } else {
      audio.pause();
      container.querySelector('.audio-card').classList.remove('playing');
      playPauseBtn.textContent = '⏵';
      localStorage.setItem(PLAY_KEY, '0');
    }
  });
  expandBtn.setAttribute('role', 'button');
  expandBtn.setAttribute('tabindex', '0');
  expandBtn.setAttribute('aria-pressed', 'false');

  function setExpanded(exp) {
    if (exp) {
      volSliderWrap.classList.add('show');
      expandBtn.setAttribute('aria-pressed', 'true');
      volSliderWrap.setAttribute('aria-hidden', 'false');
    } else {
      volSliderWrap.classList.remove('show');
      expandBtn.setAttribute('aria-pressed', 'false');
      volSliderWrap.setAttribute('aria-hidden', 'true');
    }
    localStorage.setItem('phawse_audio_expanded', exp ? '1' : '0');
  }

  expandBtn.addEventListener('click', () => setExpanded(!volSliderWrap.classList.contains('show')));
  expandBtn.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setExpanded(!volSliderWrap.classList.contains('show'));
    }
  });
  const savedExpanded = localStorage.getItem('phawse_audio_expanded');
  if (savedExpanded === '1') setExpanded(true);
  const audioCard = container.querySelector('.audio-card');
  audioCard.addEventListener('mouseenter', () => {
    volSliderWrap.classList.add('show');
    volSliderWrap.setAttribute('aria-hidden', 'false');
  });
  audioCard.addEventListener('mouseleave', () => {
    if (!volSliderWrap.classList.contains('show') || localStorage.getItem('phawse_audio_expanded') !== '1') {
      volSliderWrap.classList.remove('show');
      volSliderWrap.setAttribute('aria-hidden', 'true');
    }
  });
  audioCard.addEventListener('focusin', () => {
    volSliderWrap.classList.add('show');
    volSliderWrap.setAttribute('aria-hidden', 'false');
  });
  audioCard.addEventListener('focusout', () => {
    if (localStorage.getItem('phawse_audio_expanded') !== '1') {
      volSliderWrap.classList.remove('show');
      volSliderWrap.setAttribute('aria-hidden', 'true');
    }
  });

  let sliderTimeout;
  volRange.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    audio.volume = v / 100;
    updateBars(v);
    localStorage.setItem(VOL_KEY, v);
    startVol = v;
    playPauseBtn.textContent = v <= 0 ? '🔇' : (v < 40 ? '🔈' : (v < 80 ? '🔉' : '🔊'));
    // Update the circular dial display
    volRange.style.setProperty('--percent', `${v}%`);
    clearTimeout(sliderTimeout);
    sliderTimeout = setTimeout(() => { document.getElementById('vol-slider').classList.remove('show'); document.getElementById('vol-slider').setAttribute('aria-hidden','true'); }, 2500);
  });
  ['click','mousemove','keydown','touchstart'].forEach(ev => {
    function onceStart() {
      if (audio.paused && localStorage.getItem(PLAY_KEY) === '1') {
        audio.play().then(() => fadeVolume(0, parseFloat(volRange.value || startVol), 400)).catch(() => {});
      }
      window.removeEventListener(ev, onceStart);
    }
    window.addEventListener(ev, onceStart);
  });
  function saveState() {
    try {
      localStorage.setItem(TIME_KEY, String(audio.currentTime || 0));
      localStorage.setItem(PLAY_KEY, audio.paused ? '0' : '1');
      localStorage.setItem(VOL_KEY, audio.volume);
    } catch (e) {}
  }

  window.addEventListener('pagehide', saveState);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveState(); });
  window.addEventListener('unload', () => { clearInterval(saveTimer); saveState(); });
})();
//test again