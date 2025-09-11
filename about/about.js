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
            
            document.getElementById('avatar').src = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png?size=256`;
            document.getElementById('username').textContent = data.discord_user.global_name || data.discord_user.username;
            
            const statusDot = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            statusDot.className = data.discord_status;
            statusText.textContent = data.discord_status.charAt(0).toUpperCase() + data.discord_status.slice(1);
            const bioElement = document.getElementById('bio');
            if (data.activities && data.activities.length > 0) {
                const customStatus = data.activities.find(activity => activity.type === 4);
                if (customStatus && customStatus.state) {
                    bioElement.textContent = customStatus.state;
                } else {
                    const currentActivity = data.activities[0];
                    bioElement.textContent = `${currentActivity.name}: ${currentActivity.state || currentActivity.details || ''}`;
                }
            } else {
                bioElement.textContent = "No current status";
            }
        } catch (error) {
            console.error('Error fetching Discord profile:', error);
        }
    }
    fetchDiscordProfile();
    setInterval(fetchDiscordProfile, 60000);
});
