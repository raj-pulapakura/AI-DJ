import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { authRouter } from './routes/auth';
import cors from "cors"
import { apiRouter } from './routes/api';
import { Server } from "socket.io"
import { createServer } from 'http';
import { SpotifyService } from './services/SpotifyService';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const server = createServer(app);
export const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

// Client socket connection
io.on('connection', async (socket) => {
    const token = socket.handshake.auth?.token || '';
    const spotify = new SpotifyService(token);

    const profile = await spotify.getProfile();

    if (!profile) {
        socket.disconnect();
        return;
    }

    openAIService.registerOnMessageListener(token);

    socket.join(token);
    console.log(`[server] User socket connected: ${profile.display_name}`);

    socket.on('disconnect', () => {
        socket.leave(token);
        openAIService.deregisterOnMessageListener();
    });
});


// Middleware
app.use(cors())
app.use(express.json())
app.use(express.raw({ type: 'audio/pcm', limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/auth', authRouter)
app.use('/api', apiRouter)

// Start server
server.listen(port, () => {
    console.log(`[server] Server is running at http://localhost:${port}`);
});

// Singletons
import { OpenAIService } from './services/OpenAIService';
export const openAIService = OpenAIService.getInstance();
