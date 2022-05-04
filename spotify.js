const client_ID = '' // removed for this post
const redirect_URI = 'http://localhost:3000/';

let accessToken;

const Spotify = {
  getAccessToken() {
    // Check if accessToken is already set
    if (accessToken) {
      return accessToken;
    }

    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);

      // Clear the parameters from the URL, so the app doesn’t try grabbing the access token after it has expired
      window.setTimeout(() => (accessToken = ''), expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');

      return accessToken;
    } else {
      window.location = `https://accounts.spotify.com/authorize?client_id=${client_ID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirect_URI}`;
    }
  },

  async search(term) {
    accessToken = this.getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${term}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const jsonResponse = await response.json();

    if (!jsonResponse.tracks) {
      return [];
    }
    return jsonResponse.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      URI: track.uri,
    }));
  },

  async savePlaylist(playlistName, trackURIs) {
    if (!playlistName || !trackURIs.length) {
      return;
    }

    accessToken = this.getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
    let userID;

    try {
      // Get current user's Spotify username (user ID)
      const userID_response = await fetch(`https://api.spotify.com/v1/me`, {
        headers: headers,
      });

      const userID_jsonResponse = await userID_response.json();
      userID = userID_jsonResponse.id;

      // Create new playlist in user's account and return playlist ID
      const playlistID_response = await fetch(
        `https://api.spotify.com/v1/users/${userID}/playlists`,
        {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({
            name: playlistName,
          }),
        }
      );

      const playlistID_jsonResponse = await playlistID_response.json();
      const playlistID = playlistID_jsonResponse.id;

      // Add trackURIS to the newly created playlist
      return await fetch(
        `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, // throws 400 error
        {
          headers: headers,
          method: 'POST',
          body: JSON.stringify({
            uris: trackURIs,
          }),
        }
      );
    } catch (err) {
      return console.log(err);
    }
  },
};

export default Spotify;
