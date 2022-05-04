const clientID = ****
const redirectURI = "http://localhost:3000/";

let accessToken;


const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        // check for access Token match 

        const accessTokenMatch = window.location.href.match(/access_token([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&])*/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            // This clears the parameters, allowing us to grab a new access token when it expires.
            window.setTimeout(() => accessToken = "", expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            let accessURL = "https://accounts.spotify.com/authorize?client_id=" + clientID + "&response_type=token&scope=playlist-modify-public&redirect_uri=" + redirectURI;
         //                   "https://accounts.spotify.com/authorize?client_id=" + CLIENT_ID+ "&response_type=token&scope=playlist-modify-public&redirect_uri=" + REDIRECT_URI"
            window.location = accessURL;
        }
    },
    search(term) {
        let accessToken = Spotify.getAccessToken();
        let headers = {Authorization: `Bearer ${accessToken}`}
        // console.log(headers)
                
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: { Authorization: headers }
        }).then(response => {
            // console.log("response search " + response);
            return response.json()
        }).then(jsonResponse => {
            console.log(jsonResponse);
            if (!jsonResponse.tracks) {
                return [];
            } else {
                return jsonResponse.tracks.items.map(track => ({
                    id: track.id,
                    name: track.name,
                    artist: track.artist[0].name,
                    album: track.album.name,
                    uri: track.uri
                }));
            };
        });
    },
    savePlaylist(name, trackUris) {
        if (!name || !trackUris.length) {
            return;
        }

        let accessToken = Spotify.getAccessToken();
        let headers = {Authorization: `Bearer ${accessToken}`}
        let userId;

        return fetch('https://api.spotify.com/v1/me', { 
            headers: headers 
        }).then(response => response.json()).then(jsonResponse => {
            console.log(jsonResponse);
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ name: name })
            }).then(response => response.json()).then(jsonResponse => {
                console.log(jsonResponse);
                const playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ uris: trackUris })
                })
            });
        });
    }
}



export default Spotify;
