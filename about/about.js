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
            const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
            if (!response.ok) throw new Error('Failed to fetch Discord profile');
            
            const { data } = await response.json();
            const discordUser = data;
            document.getElementById('avatar').src = `https://cdn.discordapp.com/avatars/${discordUser.discord_user.id}/${discordUser.discord_user.avatar}.png?size=256`;
            document.getElementById('username').textContent = discordUser.discord_user.username;
            document.getElementById('discriminator').textContent = discordUser.discord_user.discriminator ? `#${discordUser.discord_user.discriminator}` : '';
            
            if (discordUser.discord_user.bio) {
                document.getElementById('bio').textContent = discordUser.discord_user.bio;
            }

            const statusDot = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            
            statusDot.className = discordUser.discord_status;
            statusText.textContent = discordUser.discord_status.charAt(0).toUpperCase() + discordUser.discord_status.slice(1);
        } catch (error) {
            console.error('Error fetching Discord profile:', error);
        }
    }
    fetchDiscordProfile();
    setInterval(fetchDiscordProfile, 60000);
});
