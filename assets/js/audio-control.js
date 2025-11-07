const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = playPauseBtn ? playPauseBtn.querySelector('.play-icon') : null;
const pauseIcon = playPauseBtn ? playPauseBtn.querySelector('.pause-icon') : null;
let currentTrackIndex = 0;
let isPlaying = false;

if (!audioPlayer) {
    console.warn('[audio-control] #audio-player element not found — audio controls disabled.');
}


const playlist = [
    { 
        title: 'You & I sped up',
        file: '/assets/music/youandi.mp3',
        cover: '/assets/music/covers/youandi.png'
    },
    { 
        title: 'Did It First',
        file: '/assets/music/diditfirst.mp3',
        cover: '/assets/music/covers/diditfirst.png'
    },
    { 
        title: 'In This Darkbess',
        file: '/assets/music/inthisdark.mp3',
        cover: '/assets/music/covers/inthisdark.png'
    },
    { 
        title: 'Let U Go',
        file: '/assets/music/letugo.mp3',
        cover: '/assets/music/covers/letugo.png'
    }
];

function loadTrack(index) {
    if (!audioPlayer) return;
    if (playlist.length === 0) {
        console.log('Please add music files to the playlist');
        return;
    }
    
    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];
    audioPlayer.src = track.file;
    const coverImage = document.getElementById('cover-image');
    if (coverImage) {
        coverImage.src = track.cover;
        coverImage.alt = `Cover art for ${track.title}`;
    }
}

function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    audioPlayer.play();
}

function togglePlayPause() {
    if (playlist.length === 0) {
        console.log('Please add music files to the playlist');
        return;
    }

    if (audioPlayer.paused) {
        if (!audioPlayer.src) {
            loadTrack(0);
        }
        audioPlayer.play();
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    } else {
        audioPlayer.pause();
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    }
}

if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
if (audioPlayer) {
    audioPlayer.addEventListener('ended', playNextTrack);
    audioPlayer.addEventListener('play', () => {
        if (playIcon) playIcon.classList.add('hidden');
        if (pauseIcon) pauseIcon.classList.remove('hidden');
        isPlaying = true;
    });

    audioPlayer.addEventListener('pause', () => {
        if (playIcon) playIcon.classList.remove('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');
        isPlaying = false;
    });

    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            audioPlayer.volume = volume;
        });
        audioPlayer.volume = volumeSlider.value / 100;
    }

    audioPlayer.addEventListener('error', (e) => {
        console.log('Error loading audio file:', e);
        playNextTrack();
    });
}