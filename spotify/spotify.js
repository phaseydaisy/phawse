const WORKER_URL = 'https://spotify-oauth.kaidenlorse1.workers.dev';

function initSpotifyLink() {
  const linkSection = document.getElementById('linkSection');
  const successSection = document.getElementById('successSection');
  const errorSection = document.getElementById('errorSection');
  const linkBtn = document.getElementById('linkBtn');
  const retryBtn = document.getElementById('retryBtn');

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');

  if (error) {
    showError('Authorization was cancelled or failed.');
    return;
  }

  // Handle OAuth callback
  if (code && state) {
    handleCallback(code, state);
    return;
  }

  // If we have a state (from Discord /spotify link), auto-start auth flow immediately
  if (state) {
    document.getElementById('inputSection')?.classList.add('hidden');
    document.getElementById('loadingMessage')?.classList.remove('hidden');
    startAuth(state);
    return;
  }

  // If no state, user likely opened the page directly
  showError('Invalid or missing session. Please run `/spotify link` in Discord to start linking.');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      errorSection.classList.add('hidden');
      linkSection.classList.remove('hidden');
    });
  }
  if (linkBtn) {
    linkBtn.addEventListener('click', () => showError('Please start from `/spotify link` in Discord.'));
  }
}

function startAuth(state) {
  if (!state) {
    alert('Missing session. Please start from `/spotify link` in Discord.');
    return;
  }
  window.location.href = `${WORKER_URL}/auth?state=${encodeURIComponent(state)}`;
}

async function handleCallback(code, state) {
  const linkSection = document.getElementById('linkSection');
  linkSection.innerHTML = '<p>Linking your Spotify account...</p>';

  try {
    const response = await fetch(`${WORKER_URL}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
    if (!response.ok) {
      throw new Error('Failed to link Spotify account');
    }
    showSuccess('Spotify connected!');
  } catch (err) {
    console.error(err);
    showError('Failed to complete linking process. Please try again from `/spotify link` in Discord.');
  }
}

function showSuccess(spotifyName) {
  document.getElementById('linkSection')?.classList.add('hidden');
  document.getElementById('errorSection')?.classList.add('hidden');
  document.getElementById('spotifyName').textContent = spotifyName;
  document.getElementById('successSection')?.classList.remove('hidden');
}

function showError(message) {
  document.getElementById('linkSection')?.classList.add('hidden');
  document.getElementById('successSection')?.classList.add('hidden');
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('errorSection')?.classList.remove('hidden');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSpotifyLink);
} else {
  initSpotifyLink();
}
