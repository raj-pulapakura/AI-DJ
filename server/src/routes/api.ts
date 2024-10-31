import express, { Request, Response } from "express";
import authMiddleware from '../middleware/authMiddleware';
import { SpotifyService } from '../services/SpotifyService';
import { openAIService } from '..';

export const apiRouter = express.Router();

apiRouter.use(authMiddleware)

apiRouter.get("/me", async (req: Request, res: Response) => {
    const access_token = req.token || "";

    try {
        const spotify = new SpotifyService(access_token);
        const profile = await spotify.getProfile();
        res.json(profile);
    } catch (error: any) {
        console.error("[error] Error retrieving user:", error.message);
        res.status(500).send(`Error retrieving user: ${error.message}`);
    }
}
);

apiRouter.post('/play', async (req: Request, res: Response) => {
    const access_token = req.token || "";
    const trackId = req.body.trackId;

    try {
        const spotify = new SpotifyService(access_token);
        await spotify.playTrack(trackId);

        res.send("Track playing");
    } catch (error: any) {
        console.error("Error playing track:", error.message);
        res.status(500).send(`Error playing track: ${error.message}`);
    }
}
);

apiRouter.post('/search', async (req: Request, res: Response) => {
    const access_token = req.token || '';
    const query = req.query.q;

    try {
        const spotify = new SpotifyService(access_token);
        const data = await spotify.search(query as string);
        res.json(data);
    } catch (error: any) {
        console.error("Error searching tracks:", error.message);
        res.status(500).send(`Error searching tracks ${error.message}`);
    }
}
);

// Use when the client wants to send one-off audio to OpenAI
apiRouter.post('/audio', async (req: Request, res: Response) => {
    const audioBuffer = req.body as Buffer;

    // Convert buffer to base64
    const base64Audio = audioBuffer.toString('base64');

    // Send audio to OpenAI
    openAIService.sendAudio(base64Audio);

    res.status(200).send()
});

// Use when the client wants to send continuous audio to OpenAI
apiRouter.post('/audio-stream', async (req: Request, res: Response) => {
    const audioBuffer = req.body as Buffer;

    // Convert buffer to base64
    const base64Audio = audioBuffer.toString('base64');

    console.log(`[API] Received audio chunk: ${base64Audio.length} bytes`);

    // Send audio to OpenAI
    openAIService.sendAudioChunk(base64Audio);

    res.status(200).send()
});