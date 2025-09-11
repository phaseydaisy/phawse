document.addEventListener('DOMContentLoaded', () => {
    function updateTime() {
        const now = new Date();
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'America/New_York'
        };
        document.getElementById('current-time').textContent = now.toLocaleTimeString('en-US', options);
    }

    updateTime();
    setInterval(updateTime, 1000);

    const DISCORD_USER_ID = '1161104305080762449';
    async function fetchDiscordProfile() {
        try {
            const response = await fetch('https://discordapp.com/api/webhooks/1415402565197107333/okWqkhR_yaJm_PZRbT3zyoGXTXflMjmfLUAZnOIs6wd9kade8hW5LO7D_2hkLIzcxTgI', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 2,
                    data: {
                        user_id: DISCORD_USER_ID
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to fetch Discord profile');
            
            const data = await response.json();
            
            // Update avatar
            document.getElementById('avatar').src = data.avatar_url || `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/a_${data.avatar}.gif?size=256` || 'https://cdn.discordapp.com/embed/avatars/0.png';
            document.getElementById('username').textContent = data.username || 'phase';
            const statusDot = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            statusDot.className = 'online';
            statusText.textContent = 'Online';

            const bioElement = document.getElementById('bio');
            bioElement.textContent = data.bio || "hey..";
        } catch (error) {
            console.error('Error fetching Discord profile:', error);
        }
    }
    fetchDiscordProfile();
    setInterval(fetchDiscordProfile, 60000);
});
