(function () {
  if (window.__phawseAudioControlInstalled) return;
  window.__phawseAudioControlInstalled = true;

  
  const SPOTIFY_CLIENT_ID = 'cf5622de811e44a583bb2a888a63a63e';
  const SPOTIFY_CLIENT_SECRET = '180aec11458f46e19069cc4b854c33e6';
  
  const SPOTIFY_TRACKS = [
    'https://open.spotify.com/track/40TZnaw4eDPChJNHw2Swf3',
    'https://open.spotify.com/track/4tXlm992qvevZGLxNg9wms?si=e9ca2346fd794736',

  ];
  
  class SpotifyClient {
    constructor(clientId) {
      this.clientId = clientId;
      this.accessToken = null;
      this.tokenExpiry = 0;
    }

    async getAccessToken() {
      if (this.accessToken && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
          },
          body: 'grant_type=client_credentials'
        });

        const data = await response.json();
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000);
        return this.accessToken;
      } catch (error) {
        console.error('Failed to get Spotify access token:', error);
        throw error;
      }
    }

    async getTrack(trackId) {
      const token = await this.getAccessToken();
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.json();
    }

    async getTrackFromUrl(url) {
      const trackId = this.extractTrackId(url);
      if (!trackId) throw new Error('Invalid Spotify URL');
      return this.getTrack(trackId);
    }

    extractTrackId(url) {
      try {
        const spotifyUrl = new URL(url);
        const path = spotifyUrl.pathname;
        if (path.startsWith('/track/')) {
          return path.split('/')[2].split('?')[0];
        }
        return null;
      } catch (error) {
        return null;
      }
    }
  }
  
  class SpotifyTrack {
    constructor(spotifyUrl, spotifyClient) {
      this.spotifyUrl = spotifyUrl;
      this.spotifyClient = spotifyClient;
      this.title = 'Loading...';
      this.artist = 'Loading...';
      this.duration = 0;
      this.albumArt = null;
      this.previewUrl = null;
      this.fetchSpotifyMetadata();
    }

    async fetchSpotifyMetadata() {
      try {
        const trackData = await this.spotifyClient.getTrackFromUrl(this.spotifyUrl);
        
        this.title = trackData.name;
        this.artist = trackData.artists.map(a => a.name).join(', ');
        this.duration = Math.round(trackData.duration_ms / 1000);
        this.albumArt = trackData.album.images[0]?.url || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // Transparent fallback
        this.previewUrl = trackData.preview_url;

        if (!this.previewUrl) {
          console.warn('No preview URL available for this track');
          this.title = 'Preview Unavailable';
          this.artist = 'Try another track';
        }

        this.updateUI();
      } catch (error) {
        console.warn('Could not fetch Spotify metadata:', error);
        this.title = 'Error Loading Track';
        this.artist = 'Error';
        this.duration = 0;
        this.albumArt = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        this.previewUrl = null;
        this.updateUI();
      }
    }

    updateUI() {
      const titleEl = document.querySelector('.vol-title');
      const artistEl = document.querySelector('.vol-sub');
      const coverEl = document.getElementById('cover-art');
      
      if (titleEl) titleEl.textContent = this.title;
      if (artistEl) artistEl.textContent = this.artist;
      if (coverEl && this.albumArt) coverEl.src = this.albumArt;
    }

    get cover() {
      return this.albumArt;
    }

    get audioUrl() {
      return this.previewUrl;
    }
  }

  const spotifyClient = new SpotifyClient(SPOTIFY_CLIENT_ID);
  const songs = SPOTIFY_TRACKS.map(url => new SpotifyTrack(url, spotifyClient));

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
    <style>
      .audio-card {
        max-inline-size: 280px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border-radius: 12px;
        padding: 12px;
        color: #fff;
        font-family: system-ui, -apple-system, sans-serif;
      }
      .audio-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .audio-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .song-cover {
        flex-shrink: 0;
      }
      .song-cover img {
        inline-size: 40px;
        block-size: 40px;
        object-fit: cover;
        border-radius: 6px;
      }
      .song-details {
        flex-grow: 1;
        min-inline-size: 0;
      }
      .vol-title {
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .spotify-link {
        color: #fff;
        text-decoration: none;
        transition: color 0.2s;
      }
      .spotify-link:hover {
        color: #1db954;
      }
      .vol-sub {
        font-size: 12px;
        opacity: 0.7;
      }
      .controls-row {
        display: flex;
        align-items: center;
        gap: 16px;
        padding-block: 4px;
      }
      .main-controls {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .control-btn {
        background: none;
        border: none;
        color: #fff;
        opacity: 0.7;
        cursor: pointer;
        font-size: 18px;
        padding: 8px;
        transition: all 0.2s;
      }
      .play-btn {
        background: none;
        border: 1px solid rgba(255,255,255,0.3);
        color: #fff;
        inline-size: 36px;
        block-size: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s;
      }
      .volume-slider {
        -webkit-appearance: none;
        inline-size: 100%;
        block-size: 3px;
        border-radius: 2px;
        background: rgba(255,255,255,0.1);
        outline: none;
        transition: all 0.2s;
      }
      .volume-slider-container {
        position: relative;
        inline-size: 80px;
      }
      .volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        block-size: 10px;
        inline-size: 10px;
        border-radius: 50%;
        background: #fff;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .volume-slider::-moz-range-thumb {
        block-size: 10px;
        inline-size: 10px;
        border-radius: 50%;
        background: #fff;
        cursor: pointer;
        border: none;
        transition: transform 0.2s;
      }
      .volume-slider:hover::-webkit-slider-thumb {
        transform: scale(1.2);
      }
      .volume-slider:hover::-moz-range-thumb {
        transform: scale(1.2);
      }
      .progress-container {
        margin-block: 4px;
        padding-block: 6px;
      }
      .progress-bar {
        block-size: 3px;
        background: rgba(255,255,255,0.1);
        border-radius: 1.5px;
        cursor: pointer;
        position: relative;
        transition: block-size 0.2s;
      }
      .progress-bar:hover {
        block-size: 4px;
      }
      .progress-current {
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
        block-size: 100%;
        background: #fff;
        border-radius: 1.5px;
        transition: width 0.1s linear;
      }
      .time-display {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        margin-block-start: 4px;
        opacity: 0.6;
        color: rgba(255,255,255,0.9);
      }
      .control-btn:hover, .volume-btn:hover {
        opacity: 1;
        transform: scale(1.1);
      }
      .play-btn:hover {
        background: rgba(255,255,255,0.1);
        border-color: #fff;
        transform: scale(1.05);
      }
      .active {
        opacity: 1;
        color: #1db954;
      }
    </style>
    <audio id="bg-audio" preload="auto">
      <source id="bg-audio-source" src="${currentSong.path}" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>
    <div id="volume-control" aria-label="Background music volume">
      <div class="audio-card enter" role="region" aria-label="background audio control">
        <div class="audio-content">
          <div class="audio-info">
            <div class="song-cover">
              <img id="cover-art" src="${currentSong.cover}" alt="Album art">
            </div>
            <div class="song-details">
              <a href="${currentSong.spotifyUrl}" 
                 target="_blank" 
                 rel="noopener"
                 class="vol-title spotify-link">
                ${currentSong.title}
              </a>
              <div class="vol-sub">${currentSong.artist}</div>
            </div>
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

          <div class="controls-row">
            <div class="main-controls">
              <button id="play-pause" class="play-btn flat-btn" aria-label="Play/Pause">⏵</button>
            </div>
            
            <div class="volume-section">
              <button id="volume-toggle" class="volume-btn flat-btn" aria-label="Toggle volume">�</button>
              <div class="volume-slider-container">
                <input id="vol-range" 
                       type="range" 
                       class="volume-slider" 
                       min="0" 
                       max="100" 
                       step="1" 
                       value="55" 
                       aria-label="Volume">
              </div>
            </div>
            
            <div class="extra-controls">
              <button id="shuffle-btn" class="control-btn flat-btn ${playlist.shuffleMode ? 'active' : ''}" aria-label="Toggle shuffle">🔀</button>
              <a id="open-spotify" 
                 href="https://open.spotify.com/track/${currentSong.spotifyId}" 
                 target="_blank" 
                 rel="noopener" 
                 class="spotify-btn flat-btn" 
                 aria-label="Open in Spotify">
                <svg class="spotify-icon" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </a>
            </div>
          </div>

          <div class="visual-bars" aria-hidden="true">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(container);
  } else {
    
    const srcEl = container.querySelector('#bg-audio-source');
    if (srcEl && randomSong?.audioUrl) {
      try { 
        srcEl.src = randomSong.audioUrl;
        if (audio) {
          audio.load();
        }
      } catch (e) {
        console.warn('Error setting audio source:', e);
      }
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
  const volumeBtn = document.getElementById('volume-toggle');
  const volSliderContainer = document.querySelector('.volume-slider-container');
  const prevBtn = document.getElementById('prev-track');
  const nextBtn = document.getElementById('next-track');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const progressBar = document.getElementById('progress-current');
  const currentTimeDisplay = document.getElementById('current-time');
  const totalTimeDisplay = document.getElementById('total-time');
  const coverArt = document.getElementById('cover-art');

  if (!audio) return;

  const VOL_KEY = 'phawse_audio_vol';
  const TIME_KEY = 'phawse_audio_time';
  const PLAY_KEY = 'phawse_audio_playing';
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
  
  function fadeVolume(from, to, duration) {
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const volume = (from + (to - from) * t) / 100;
      audio.volume = Math.max(0, Math.min(1, volume)); 
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  audio.volume = startVol / 100;

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
    source.src = song.audioUrl;
    document.querySelector('.vol-title').textContent = song.title;
    document.querySelector('.vol-sub').textContent = song.artist;
    document.getElementById('open-spotify').href = song.spotifyUrl;
    
    const coverImg = document.getElementById('cover-art');
    if (coverImg) {
      coverImg.src = song.cover;
    }

    audio.load();
    if (!audio.paused) {
      audio.play().then(() => {
        initAudioContext();
        updateVisualization();
      });
    }

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration) {
        totalTimeDisplay.textContent = formatTime(audio.duration);
      }
    }, { once: true });
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

  // Add click handler for the progress bar
  const progressBarElement = document.getElementById('progress-bar');
  progressBarElement.addEventListener('click', (e) => {
    const rect = progressBarElement.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pos * audio.duration;
    updateProgress();
  });

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

  function updateVolumeIcon(volume) {
    const icon = volume <= 0 ? '🔇' : volume < 30 ? '🔈' : volume < 70 ? '🔉' : '🔊';
    volumeBtn.textContent = icon;
  }

  volumeBtn.addEventListener('click', () => {
    volSliderContainer.classList.toggle('show');
    volumeBtn.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.volume-section')) {
      volSliderContainer.classList.remove('show');
      volumeBtn.classList.remove('active');
    }
  });

  volRange.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    fadeVolume(audio.volume * 100, v, 100);
    updateVolumeIcon(v);
    localStorage.setItem(VOL_KEY, v);
    startVol = v;
  
    volRange.style.setProperty('--volume-level', `${v}%`);
  });

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
})();   // UPDATE of END /2