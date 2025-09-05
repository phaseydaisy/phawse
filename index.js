const CLIENT_ID = "cf5622de811e44a583bb2a888a63a63e";
const REDIRECT_URI = "https://phawse/callback";
const SCOPE = "user-read-currently-playing user-read-recently-played user-top-read";

document.getElementById("linkBtn").addEventListener("click", () => {
  const discordId = prompt("Enter your Discord ID to link:");
  if (!discordId) return alert("Discord ID required");

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    state: discordId
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
});
