import React, { useEffect } from "react";
// import SpotifyGetPlaylists from "./components/SpotifyGetPlaylists/SpotifyGetPlaylists";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID; 
const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const REDIRECT_URL_AFTER_LOGIN = "http://localhost:5175/stats";
const SPACE_DELIMITER = "%20";
const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "playlist-read-private",
];
const SCOPES_URL_PARAM = SCOPES.join(SPACE_DELIMITER);


function Login(){
const handleLogin = () => {
    window.location = `${SPOTIFY_AUTHORIZE_ENDPOINT}?client_id=${CLIENT_ID}&redirect_url=${REDIRECT_URL_AFTER_LOGIN}&scope=${SCOPES_URL_PARAM}&response_type+token&show_dialog=true`;
}
  return (
    <div className="container">
        <div className="bg-img_login">
            
        </div>
      <h1>Bumper</h1>
      <button onClick={handleLogin}>login to spotify</button>
    </div>
  );
};
export default Login






