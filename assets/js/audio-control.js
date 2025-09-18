// Get DOM elements
const audioPlayer = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = playPauseBtn.querySelector('.play-icon');
const pauseIcon = playPauseBtn.querySelector('.pause-icon');

// Playlist configuration
let currentTrackIndex = 0;
let isPlaying = false;


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
    if (playlist.length === 0) {
        console.log('Please add music files to the playlist');
        return;
    }
    
    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];
    audioPlayer.src = track.file;
    
    // Update cover art
    const coverImage = document.getElementById('cover-image');
    coverImage.src = track.cover;
    coverImage.alt = `Cover art for ${track.title}`;
}

// Function to play the next track
function playNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    audioPlayer.play();
}

// Play/Pause toggle function
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

// Event Listeners
playPauseBtn.addEventListener('click', togglePlayPause);

// Auto-play next track when current track ends
audioPlayer.addEventListener('ended', playNextTrack);

// Update play/pause button state based on audio player state
audioPlayer.addEventListener('play', () => {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    isPlaying = true;
});

audioPlayer.addEventListener('pause', () => {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    isPlaying = false;
});

// Error handling
audioPlayer.addEventListener('error', (e) => {
    console.log('Error loading audio file:', e);
    playNextTrack(); // Skip to next track if current track fails to load
});