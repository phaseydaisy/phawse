
const CLIENT_ID = "cf5622de811e44a583bb2a888a63a63e";
const REDIRECT_URI = "https://phawse.lol/callback";
const SCOPE = "user-read-currently-playing user-read-recently-played user-top-read";

document.getElementById("linkBtn").addEventListener("click", () => {
  const discordId = document.getElementById("discordIdInput").value.trim();
  if (!discordId) {
    alert("Please enter your Discord ID");
    return;
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    state: discordId
  });

  const oauthUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  window.location.href = oauthUrl;
});
