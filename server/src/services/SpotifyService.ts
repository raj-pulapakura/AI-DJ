import axios from 'axios';

export class SpotifyService {
    constructor(public accessToken: string) { }

    async getProfile() {
        const response = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                "Authorization": `Bearer ${this.accessToken}`,
            },
        });


        return response.data;
    }

    async playTrack(trackId: string, deviceId?: string) {
        const response = await axios.put(
            "https://api.spotify.com/v1/me/player/play" + (deviceId ? `?device_id=${deviceId}` : ""),
            {
                "uris": [`spotify:track:${trackId}`],
            }, {
            headers: {
                "Authorization": `Bearer ${this.accessToken}`,
            },
        })
    }

    async playAlbumArtistOrPlaylist(uri: string, deviceId?: string) {
        const response = await axios.put(
            "https://api.spotify.com/v1/me/player/play" + (deviceId ? `?device_id=${deviceId}` : ""),
            {
                "context_uri": uri,
            }, {
            headers: {
                "Authorization": `Bearer ${this.accessToken}`,
            },
        })
    }

    async search(query: string, type: "track" | "album" | "artist" | "playlist" = "track") {
        const response = await axios.get("https://api.spotify.com/v1/search", {
            params: {
                q: query,
                type: type,
            },
            headers: {
                "Authorization": `Bearer ${this.accessToken}`,
            },
        });

        return response.data;
    }

    async getDevices() {
        const response = await axios.get("https://api.spotify.com/v1/me/player/devices", {
            headers: {
                "Authorization": `Bearer ${this.accessToken}`,
            },
        });

        return response.data;
    }

    async pause(deviceId?: string) {
        const response = await axios.put(
            "https://api.spotify.com/v1/me/player/pause" + (deviceId ? `?device_id=${deviceId}` : ""),
            null, {
            headers: {
                "Authorization": `Bearer ${this.accessToken}`,
            },
        });

        return response.data;
    }

    async skipToNext(deviceId?: string) {
        const response = await axios.post(
            "https://api.spotify.com/v1/me/player/next" + (deviceId ? `?device_id=${deviceId}` : ""),
            null, {
            headers: {
                "Authorization": `Bearer ${this.accessToken}`,
            },
        });

        return response.data;
    }

    async skipToPrevious(deviceId?: string) {
        const response = await axios.post(
            "https://api.spotify.com/v1/me/player/previous" + (deviceId ? `?device_id=${deviceId}` : ""),
            null, {
            headers: {
                "Authorization": `Bearer ${this.accessToken}`,
            },
        });

        return response.data;
    }

    async addToQueue(trackId: string, deviceId?: string) {
        const response = await axios.post(
            "https://api.spotify.com/v1/me/player/queue" + (deviceId ? `?device_id=${deviceId}` : ""),
            {
                "uri": `spotify:track:${trackId}`,
            }, {
            headers: {
                "Authorization": `Bearer ${this.accessToken}`,
            },
        });

        return response.data;
    }
}