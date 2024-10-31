import axios from 'axios';
import express, { Request, Response } from "express";

// User section
export const authRouter = express.Router();

authRouter.get('/callback', async (req: Request, res: Response) => {
    const code = req.query.code || null;
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = "http://localhost:8888/auth/callback";

    try {
        const response = await axios.post("https://accounts.spotify.com/api/token", null, {
            params: {
                grant_type: "authorization_code",
                code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const { access_token, refresh_token } = response.data;

        res.redirect(`http://localhost:5173/auth?access_token=${access_token}&refresh_token=${refresh_token}`);

        // Store tokens (session, JWT, or database)
        // Redirect or respond to the front-end with tokens
    } catch (error) {
        console.error("Error retrieving tok/ens:", error);
        res.status(500).send("Authentication failed");
    }
});

authRouter.post("/refresh-token", async (req, res) => {
    const refresh_token = req.body.refresh_token;

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    try {
        const response = await axios.post("https://accounts.spotify.com/api/token", null, {
            params: {
                grant_type: "refresh_token",
                refresh_token,
                client_id: clientId,
                client_secret: clientSecret,
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const { access_token, refresh_token: new_refresh_token } = response.data;

        res.json({ access_token, refresh_token: new_refresh_token });
    } catch (error) {
        console.error("Error refreshing token:", error);
        res.status(500).send("Token refresh failed");
    }
});