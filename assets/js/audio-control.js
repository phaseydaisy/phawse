// Create an invisible iframe for Spotify
const spotifyIframe = document.createElement('iframe');
spotifyIframe.style.display = 'none';
spotifyIframe.src = 'https://open.spotify.com/embed/playlist/0v5LP5VIEEmUzES7HEqONt?utm_source=generator&theme=0';
spotifyIframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
document.body.appendChild(spotifyIframe);
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = playPauseBtn.querySelector('.play-icon');
const pauseIcon = playPauseBtn.querySelector('.pause-icon');

let isPlaying = false;
function togglePlayPause() {
    if (isPlaying) {
        spotifyIframe.contentWindow.postMessage({ command: 'pause' }, '*');
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
    } else {
        spotifyIframe.contentWindow.postMessage({ command: 'play' }, '*');
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
    }
    isPlaying = !isPlaying;
}

playPauseBtn.addEventListener('click', togglePlayPause);
window.addEventListener('message', (event) => {
    if (event.data.type === 'playback_update') {
        isPlaying = event.data.data.isPlaying;
        if (isPlaying) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
    }
});