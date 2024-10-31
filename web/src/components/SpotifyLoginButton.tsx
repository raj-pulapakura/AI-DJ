import { div } from 'framer-motion/client';

const redirectUri = encodeURIComponent(`${import.meta.env.VITE_AUTH_CALLBACK_URL}`); // Adjust to match your server route
const scopes = [
    'user-read-private',
    'user-read-email',
    'app-remote-control',
    'playlist-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
];
const authEndpoint = 'https://accounts.spotify.com/authorize';

export default function SpotifyLoginButton() {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

    const handleLogin = () => {
        const authUrl = `${authEndpoint}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes.join(
            '%20'
        )}`;
        window.location.href = authUrl; // Redirect to Spotify authorization page
    };

    return (
        <button
            onClick={handleLogin}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded "
        >
            Log in with Spotify
        </button>

    )
}
