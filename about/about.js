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
            const response = await fetch(`https://japi.rest/discord/v1/user/${DISCORD_USER_ID}`, {
                headers: {
                    'Authorization': 'BfbEMm4Z5Z2myB3YbseTR7th'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch Discord profile');
            
            const data = await response.json();
            
            document.getElementById('avatar').src = `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${data.data.avatar}.png?size=512`;
            document.getElementById('username').textContent = data.data.global_name || data.data.username;
            
            const statusDot = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            const presence = data.data.presence || {};
            statusDot.className = presence.status || 'online';
            statusText.textContent = (presence.status || 'Online').charAt(0).toUpperCase() + (presence.status || 'online').slice(1);

            const bioElement = document.getElementById('bio');
            if (presence.activities && presence.activities.length > 0) {
                const activity = presence.activities[0];
                bioElement.textContent = activity.name;
            } else {
                bioElement.textContent = "hi im phase!";
            }
        } catch (error) {
            console.error('Error fetching Discord profile:', error);
            document.getElementById('avatar').src = `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/a_ab3e4550c9644f12485117ba7d46c17e.gif?size=512`;
            document.getElementById('username').textContent = 'phase';
            document.getElementById('bio').textContent = "hi im phase!";
        }
    }
    fetchDiscordProfile();
    setInterval(fetchDiscordProfile, 60000);
});
