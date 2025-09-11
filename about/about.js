document.addEventListener('DOMContentLoaded', () => {
    // Update time function
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

    // Update time every second
    updateTime();
    setInterval(updateTime, 1000);

    // Your Discord user ID
    const DISCORD_USER_ID = 'YOUR_DISCORD_USER_ID'; // Replace with your Discord user ID
    
    // Function to fetch Discord profile
    async function fetchDiscordProfile() {
        try {
            const response = await fetch(`https://discord.com/api/v9/users/${DISCORD_USER_ID}`, {
                headers: {
                    'Authorization': 'Bot YOUR_BOT_TOKEN' // Replace with your Discord bot token
                }
            });

            if (!response.ok) throw new Error('Failed to fetch Discord profile');

            const data = await response.json();
            
            // Update profile information
            document.getElementById('avatar').src = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=256`;
            document.getElementById('username').textContent = data.username;
            document.getElementById('discriminator').textContent = `#${data.discriminator}`;
            
            if (data.bio) {
                document.getElementById('bio').textContent = data.bio;
            }

            // Update status (you'll need to implement your own status checking logic)
            const statusDot = document.getElementById('status-dot');
            const statusText = document.getElementById('status-text');
            
            // Example status (you'll need to implement real status checking)
            statusDot.className = 'online';
            statusText.textContent = 'Online';
        } catch (error) {
            console.error('Error fetching Discord profile:', error);
        }
    }

    // Fetch Discord profile initially
    fetchDiscordProfile();
    
    // Optionally refresh Discord profile periodically
    setInterval(fetchDiscordProfile, 60000); // Update every minute
});
