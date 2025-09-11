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
            // Using Toolscord API
            const response = await fetch(`https://api.toolscord.com/profile/${DISCORD_USER_ID}`);
            if (!response.ok) throw new Error('Failed to fetch Discord profile');
            
            const data = await response.json();
            
            // Update avatar
            document.getElementById('avatar').src = data.avatar;
            
            // Update username
            document.getElementById('username').textContent = data.username;
            
            // Update status
            const statusDot = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            const status = data.status || 'online';
            statusDot.className = status.toLowerCase();
            statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);

            // Update bio/activity
            const bioElement = document.getElementById('bio');
            if (data.activities && data.activities.length > 0) {
                const activity = data.activities[0];
                bioElement.textContent = activity.name + (activity.details ? `: ${activity.details}` : '');
            } else {
                bioElement.textContent = data.bio || "hi im phase!";
            }
        } catch (error) {
            console.error('Error fetching Discord profile:', error);
        }
    }
    fetchDiscordProfile();
    setInterval(fetchDiscordProfile, 60000);
});
