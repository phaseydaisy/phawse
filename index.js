const BACKEND_AUTHORIZE_URL = "https://spotify-backend.onrender.com/authorize"

document.getElementById("linkBtn").addEventListener("click", async () => {
    const discordUserId = prompt("Enter your Discord ID");
    if (!discordUserId) return alert("Discord ID required");

    const url = `${BACKEND_AUTHORIZE_URL}?user_id=${discordUserId}`;
    window.location.href = url;
});
