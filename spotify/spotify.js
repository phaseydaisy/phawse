const WORKER_URL = 'https://spotify-oauth.kaidenlorse1.workers.dev';

function initSpotifyLink() {
  const linkSection = document.getElementById('linkSection');
  const successSection = document.getElementById('successSection');
  const errorSection = document.getElementById('errorSection');
  const linkBtn = document.getElementById('linkBtn');
  const retryBtn = document.getElementById('retryBtn');
  const discordIdInput = document.getElementById('discordId');

  // Check if we're on the callback page (after Spotify redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');

  if (error) {
    showError('Authorization was cancelled or failed.');
    return;
  }

  if (code && state) {
    // We're on callback, handle it
    handleCallback(code, state);
    return;
  }

  // Normal landing page - set up link button
  linkBtn.addEventListener('click', startAuth);
  retryBtn.addEventListener('click', () => {
    errorSection.classList.add('hidden');
    linkSection.classList.remove('hidden');
  });

  discordIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      startAuth();
    }
  });
}

function startAuth() {
  const discordId = document.getElementById('discordId').value.trim();
  
  if (!discordId) {
    alert('Please enter your Discord User ID');
    return;
  }

  if (!/^\d+$/.test(discordId)) {
    alert('Discord User ID should only contain numbers');
    return;
  }

  // Redirect to worker auth endpoint
  window.location.href = `${WORKER_URL}/auth?user=${discordId}`;
}

async function handleCallback(code, discordUserId) {
  const linkSection = document.getElementById('linkSection');
  linkSection.innerHTML = '<p>Linking your Spotify account...</p>';

  try {
    // The worker will handle the token exchange
    const response = await fetch(`${WORKER_URL}/callback?code=${code}&state=${discordUserId}`);
    
    if (!response.ok) {
      throw new Error('Failed to link Spotify account');
    }

    // Try to get user info to show
    const userResponse = await fetch(`${WORKER_URL}/user?user=${discordUserId}`);
    const userData = await userResponse.json();

    showSuccess(userData.spotify_name || 'Spotify User');
  } catch (err) {
    console.error(err);
    showError('Failed to complete linking process. Please try again.');
  }
}

function showSuccess(spotifyName) {
  document.getElementById('linkSection').classList.add('hidden');
  document.getElementById('errorSection').classList.add('hidden');
  document.getElementById('spotifyName').textContent = `Connected as: ${spotifyName}`;
  document.getElementById('successSection').classList.remove('hidden');
}

function showError(message) {
  document.getElementById('linkSection').classList.add('hidden');
  document.getElementById('successSection').classList.add('hidden');
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('errorSection').classList.remove('hidden');
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSpotifyLink);
} else {
  initSpotifyLink();
}
