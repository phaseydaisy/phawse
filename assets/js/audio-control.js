(function () {
  if (window.__phawseAudioControlInstalled) return;
  window.__phawseAudioControlInstalled = true;

  const songs = [
    { 
      path: '/assets/music/letugo.mp3', 
      title: 'Let U Go',
      artist: 'Phawse',
      spotifyId: '40TZnaw4eDPChJNHw2Swf3',
      duration: 184,
      get cover() {
        return this.path.replace('.mp3', '.png').replace('/music/', '/music/covers/');
      }
    }
  ];

  class PlaylistManager {
    constructor(songs) {
      this.songs = songs;
      this.currentIndex = 0;
      this.shuffleMode = false;
      this.shuffledIndices = [];
      this.loadState();
    }

    loadState() {
      const savedIndex = localStorage.getItem('phawse_current_song');
      const savedShuffle = localStorage.getItem('phawse_shuffle_mode');
      if (savedIndex !== null) this.currentIndex = parseInt(savedIndex);
      if (savedShuffle !== null) this.shuffleMode = savedShuffle === '1';
      if (this.shuffleMode) this.generateShuffleIndices();
    }

    saveState() {
      localStorage.setItem('phawse_current_song', this.currentIndex);
      localStorage.setItem('phawse_shuffle_mode', this.shuffleMode ? '1' : '0');
    }

    generateShuffleIndices() {
      this.shuffledIndices = Array.from({length: this.songs.length}, (_, i) => i);
      for (let i = this.shuffledIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.shuffledIndices[i], this.shuffledIndices[j]] = [this.shuffledIndices[j], this.shuffledIndices[i]];
      }
    }

    getCurrentSong() {
      return this.songs[this.currentIndex];
    }

    nextSong() {
      if (this.shuffleMode) {
        const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentIndex);
        const nextShuffleIndex = (currentShuffleIndex + 1) % this.songs.length;
        this.currentIndex = this.shuffledIndices[nextShuffleIndex];
      } else {
        this.currentIndex = (this.currentIndex + 1) % this.songs.length;
      }
      this.saveState();
      return this.getCurrentSong();
    }

    previousSong() {
      if (this.shuffleMode) {
        const currentShuffleIndex = this.shuffledIndices.indexOf(this.currentIndex);
        const prevShuffleIndex = (currentShuffleIndex - 1 + this.songs.length) % this.songs.length;
        this.currentIndex = this.shuffledIndices[prevShuffleIndex];
      } else {
        this.currentIndex = (this.currentIndex - 1 + this.songs.length) % this.songs.length;
      }
      this.saveState();
      return this.getCurrentSong();
    }

    toggleShuffle() {
      this.shuffleMode = !this.shuffleMode;
      if (this.shuffleMode) this.generateShuffleIndices();
      this.saveState();
      return this.shuffleMode;
    }
  }

  const playlist = new PlaylistManager(songs);
  const currentSong = playlist.getCurrentSong();
  
  let container = document.getElementById('phawse-audio-root');
  if (!container) {
    container = document.createElement('div');
    container.id = 'phawse-audio-root';
    container.innerHTML = `
    <audio id="bg-audio" preload="auto">
      <source id="bg-audio-source" src="${currentSong.path}" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
    <div id="volume-control" aria-label="Background music volume">
      <div class="audio-card enter" role="region" aria-label="background audio control">
        <div class="audio-main">
          <div class="player-controls">
            <button id="prev-track" class="control-btn" aria-label="Previous track">⏮</button>
            <button id="play-pause" class="vol-btn" aria-label="Play/Pause">⏵</button>
            <button id="next-track" class="control-btn" aria-label="Next track">⏭</button>
          </div>
          <div class="vol-meta">
            <div class="vol-title">${currentSong.title}</div>
            <div class="vol-sub">${currentSong.artist}</div>
          </div>
          <div class="progress-container">
            <div id="progress-bar" class="progress-bar">
              <div id="progress-current" class="progress-current"></div>
            </div>
            <div class="time-display">
              <span id="current-time">0:00</span>
              <span id="total-time">${Math.floor(currentSong.duration / 60)}:${String(currentSong.duration % 60).padStart(2, '0')}</span>
            </div>
          </div>
          <div class="visual-bars" aria-hidden="true">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
        </div>
        <div class="vol-actions">
          <button id="shuffle-btn" class="control-btn ${playlist.shuffleMode ? 'active' : ''}" aria-label="Toggle shuffle">🔀</button>
          <button id="expand-btn" class="expand-btn" aria-label="Open volume control">⚙️</button>
        </div>
        <div class="vol-slider" id="vol-slider" aria-hidden="true">
          <div class="volume-control">
            <span class="volume-icon">🔊</span>
            <input id="vol-range" type="range" min="0" max="100" step="1" value="55">
          </div>
          <a id="open-spotify" href="https://open.spotify.com/track/${currentSong.spotifyId}" target="_blank" rel="noopener" aria-label="Open in Spotify">
            <img src="/assets/images/spotify.png" alt="Spotify" class="spotify-icon"> Open in Spotify
          </a>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(container);
  } else {
    
    const srcEl = container.querySelector('#bg-audio-source');
    if (srcEl && srcEl.src && !srcEl.src.includes(randomSong.path)) {
      try { srcEl.src = randomSong.path; } catch (e) {}
    }
  }
  let host = document.querySelector('.phawse-audio-host');
  if (!host) {
    host = document.createElement('div');
    host.className = 'phawse-audio-host';
    document.body.appendChild(host);
  }
  if (container.parentElement !== host) {
    host.appendChild(container);
  }
  
  container.querySelector('.audio-card')?.classList.add('thin');
  const audio = document.getElementById('bg-audio');
  const volRange = document.getElementById('vol-range');
  const playPauseBtn = document.getElementById('play-pause');
  const expandBtn = document.getElementById('expand-btn');
  const volSliderWrap = document.getElementById('vol-slider');
  const prevBtn = document.getElementById('prev-track');
  const nextBtn = document.getElementById('next-track');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const progressBar = document.getElementById('progress-current');
  const currentTimeDisplay = document.getElementById('current-time');
  const totalTimeDisplay = document.getElementById('total-time');

  if (!audio) return;

  const VOL_KEY = 'phawse_audio_vol';
  const TIME_KEY = 'phawse_audio_time';
  const PLAY_KEY = 'phawse_audio_playing';
  
  // Create AudioContext for visualization
  let audioContext, analyser, dataArray;
  function initAudioContext() {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 32;
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  }

  function updateProgress() {
    if (audio.duration) {
      const progress = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${progress}%`;
      currentTimeDisplay.textContent = formatTime(audio.currentTime);
      totalTimeDisplay.textContent = formatTime(audio.duration);
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Update visualization
  function updateVisualization() {
    if (!audioContext || !analyser) return;
    analyser.getByteFrequencyData(dataArray);
    const bars = document.querySelectorAll('.visual-bars .bar');
    const barCount = bars.length;
    const step = Math.floor(dataArray.length / barCount);
    
    bars.forEach((bar, i) => {
      const startIndex = i * step;
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[startIndex + j];
      }
      const average = sum / step;
      const height = Math.max(8, (average / 256) * 100);
      bar.style.height = `${height}%`;
    });
    
    if (!audio.paused) {
      requestAnimationFrame(updateVisualization);
    }
  }

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
  function loadSong(song) {
    const source = document.getElementById('bg-audio-source');
    source.src = song.path;
    document.querySelector('.vol-title').textContent = song.title;
    document.querySelector('.vol-sub').textContent = song.artist;
    document.getElementById('open-spotify').href = `https://open.spotify.com/track/${song.spotifyId}`;
    audio.load();
    if (!audio.paused) {
      audio.play().then(() => {
        initAudioContext();
        updateVisualization();
      });
    }
  }

  playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        fadeVolume(audio.volume, Math.max(0.01, startVol), 300);
        container.querySelector('.audio-card').classList.add('playing');
        playPauseBtn.textContent = '⏸';
        localStorage.setItem(PLAY_KEY, '1');
        initAudioContext();
        updateVisualization();
      }).catch(() => {});
    } else {
      audio.pause();
      container.querySelector('.audio-card').classList.remove('playing');
      playPauseBtn.textContent = '⏵';
      localStorage.setItem(PLAY_KEY, '0');
    }
  });

  nextBtn.addEventListener('click', () => {
    const nextSong = playlist.nextSong();
    loadSong(nextSong);
  });

  prevBtn.addEventListener('click', () => {
    const prevSong = playlist.previousSong();
    loadSong(prevSong);
  });

  shuffleBtn.addEventListener('click', () => {
    const isShuffled = playlist.toggleShuffle();
    shuffleBtn.classList.toggle('active', isShuffled);
  });

  audio.addEventListener('ended', () => {
    const nextSong = playlist.nextSong();
    loadSong(nextSong);
  });

  audio.addEventListener('timeupdate', updateProgress);
  expandBtn.setAttribute('role', 'button');
  expandBtn.setAttribute('tabindex', '0');
  expandBtn.setAttribute('aria-pressed', 'false');

  function setExpanded(exp) {
    if (exp) {
      volSliderWrap.classList.add('show');
      expandBtn.setAttribute('aria-pressed', 'true');
      volSliderWrap.setAttribute('aria-hidden', 'false');
      container.querySelector('.audio-card')?.classList.remove('thin');
    } else {
      volSliderWrap.classList.remove('show');
      expandBtn.setAttribute('aria-pressed', 'false');
      volSliderWrap.setAttribute('aria-hidden', 'true');
      container.querySelector('.audio-card')?.classList.add('thin');
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
  const volumeIcon = document.querySelector('.volume-icon');
  
  function updateVolumeIcon(volume) {
    const icon = volume <= 0 ? '🔇' : volume < 30 ? '🔈' : volume < 70 ? '🔉' : '🔊';
    volumeIcon.textContent = icon;
  }

  volRange.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    fadeVolume(audio.volume * 100, v, 100);
    updateVolumeIcon(v);
    localStorage.setItem(VOL_KEY, v);
    startVol = v;
    
    // Add visual feedback to the slider
    volRange.style.setProperty('--percent', `${v}%`);
    volRange.style.setProperty('--thumb-scale', '1.2');
    clearTimeout(sliderTimeout);
    sliderTimeout = setTimeout(() => {
      volRange.style.setProperty('--thumb-scale', '1');
      if (!volSliderWrap.matches(':hover')) {
        volSliderWrap.classList.remove('show');
        volSliderWrap.setAttribute('aria-hidden', 'true');
      }
    }, 2500);
  });

  // Double click to reset to default volume
  volRange.addEventListener('dblclick', () => {
    const defaultVolume = 55;
    volRange.value = defaultVolume;
    fadeVolume(audio.volume * 100, defaultVolume, 200);
    updateVolumeIcon(defaultVolume);
    localStorage.setItem(VOL_KEY, defaultVolume);
    startVol = defaultVolume;
    volRange.style.setProperty('--percent', `${defaultVolume}%`);
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