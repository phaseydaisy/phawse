const WORKER_URL = 'https://spotify-oauth.kaidenlorse1.workers.dev';

function initSpotifyLink() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');

  if (error) {
    showError('Authorization was cancelled or failed.');
    return;
  }

  if (code && state) {
    handleCallback(code, state);
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

async function handleCallback(code, state) {
  const linkSection = document.getElementById('linkSection');
  if (linkSection) {
    linkSection.innerHTML = '<div class="loader"></div><p>Linking your Spotify account...</p>';
  }

  try {
    const response = await fetch(`${WORKER_URL}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to link Spotify account');
    }
    const data = await response.json();
    showSuccess(data.spotify_name || 'Unknown User');
  } catch (err) {
    console.error(err);
    showError(err.message || 'Failed to complete linking process. Please try again from `/spotify link` in Discord.');
  }
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
