const WORKER_URL = 'https://spotify-oauth.kaidenlorse1.workers.dev';

function initSpotifyLink() {
  const urlParams = new URLSearchParams(window.location.search);
  const state = urlParams.get('state');
  const success = urlParams.get('success');
  const name = urlParams.get('name');
  const error = urlParams.get('error');

  if (success === 'true' && name) {
    showSuccess(decodeURIComponent(name));
    return;
  }

  if (error) {
    showError(decodeURIComponent(error));
    return;
  }

  if (state) {
    startAuth(state);
    return;
  }

  showError('Invalid or missing session. Please run `/spotify link` in Discord to start linking.');
}

function startAuth(state) {
  if (!state) {
    showError('Missing session. Please start from `/spotify link` in Discord.');
    return;
  }
  window.location.href = `${WORKER_URL}/auth?state=${encodeURIComponent(state)}`;
}

function showSuccess(spotifyName) {
  document.getElementById('linkSection')?.classList.add('hidden');
  document.getElementById('errorSection')?.classList.add('hidden');
  const nameElement = document.getElementById('spotifyName');
  if (nameElement) {
    nameElement.textContent = spotifyName;
  }
  document.getElementById('successSection')?.classList.remove('hidden');
}

function showError(message) {
  document.getElementById('linkSection')?.classList.add('hidden');
  document.getElementById('successSection')?.classList.add('hidden');
  const errorElement = document.getElementById('errorMessage');
  if (errorElement) {
    errorElement.textContent = message;
  }
  document.getElementById('errorSection')?.classList.remove('hidden');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSpotifyLink);
} else {
  initSpotifyLink();
}
