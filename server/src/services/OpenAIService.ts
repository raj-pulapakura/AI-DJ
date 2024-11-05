import WebSocket from "ws";
import { io } from '..';
import { SpotifyService } from './SpotifyService';

// Singleton class to interact with OpenAI Realtime API
export class OpenAIService {
    static instance: OpenAIService;

    private tools = [
        {
            type: "function",
            name: "play_song",
            description: "Play a track/album/artist/playlist on Spotify",
            parameters: {
                type: "object",
                properties: {
                    query: { "type": "string" },
                    type: {
                        type: "string",
                        enum: ["track", "album", "artist", "playlist"]
                    },
                    deviceId: { "type": "string" },
                },
                required: ["query"]
            }
        },
        {
            type: "function",
            name: "get_available_devices",
            description: "Gets available devices connected to Spotify",
        },
        {
            type: "function",
            name: "pause",
            description: "Pause Spotify playback",
        },
        {
            type: "function",
            name: "skip",
            description: "Skip to the next song",
        },
        {
            type: "function",
            name: "previous",
            description: "Skip to the previous song",
        },
        {
            type: "function",
            name: "add_track_to_queue",
            description: "Add a track/album/artist/playlist to the queue on Spotify",
            parameters: {
                type: "object",
                properties: {
                    query: { "type": "string" },
                    deviceId: { "type": "string" }
                },
                required: ["query"]
            }
        }
    ]

    private instructions = "You are a DJ and an expert in music. You can play any song on Spotify. You have a very chill and easy-going personality. You love music, and want to help the user play songs that match their mood. Your vocabulary is very relaxed and informal, and you don't hesitate to use slang words."

    private openAIWebSocket: WebSocket;

    private constructor() {
        this.openAIWebSocket = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'OpenAI-Beta': 'realtime=v1',
            },
        });

        this.openAIWebSocket.on('open', () => {
            console.log('[server] Connected to OpenAI Realtime API');
        });

        this.openAIWebSocket.on('error', (error) => {
            console.error('[server] Error with OpenAI Realtime API:', error);
        });
    }

    public static getInstance(): OpenAIService {
        if (!OpenAIService.instance) {
            OpenAIService.instance = new OpenAIService();
        }

        return OpenAIService.instance;
    }

    public registerOnMessageListener(accessToken: string) {
        this.openAIWebSocket.send(JSON.stringify(
            {
                type: 'session.update',
                session: {
                    tools: this.tools,
                    instructions: this.instructions,
                    voice: 'alloy',
                    input_audio_transcription: {
                        model: "whisper-1"
                    },
                }
            }
        ));

        this.openAIWebSocket.on('message', async (data: any) => {

            const event = JSON.parse(data);
            console.log("[server] Received event: ", event.type);

            if (event.type === "error") {
                console.error("[server] Error from OpenAI:", event);
                return;
            }

            if (event.type === "conversation.item.input_audio_transcription.failed") {
                console.error("[server] Failed to transcribe audio");
                console.log(JSON.stringify(event, null, 2));
                return;
            }

            if (event.type === 'response.audio.delta') {

                const audio = event.delta;
                console.log(`[server] Received audio: ${audio.length} bytes`);
                io.to(accessToken).emit('audio', audio);

            }

            else if (event.type === 'response.audio.done') {

                console.log(`[server] Audio completed`);
                io.to(accessToken).emit('audio_complete', {});

            }

            else if (event.type === "response.function_call_arguments.done") {

                const functionName = event.name;
                const args = JSON.parse(event.arguments);
                const callId = event.call_id;

                if (functionName === "play_song") {

                    const { query, type, deviceId } = args;

                    const spotify = new SpotifyService(accessToken);
                    const results = await spotify.search(query, type);

                    console.log(results);

                    let status = ""

                    if (type === "track") {
                        const track = results.tracks.items[0];
                        await spotify.playTrack(track.id, deviceId);
                        status = `Playing ${track.name} by ${track.artists[0].name}`
                    } else {
                        const item = results[type + "s"].items[0];
                        await spotify.playAlbumArtistOrPlaylist(item.uri, deviceId);
                        status = `Playing ${item.name}`
                    }

                    this.openAIWebSocket.send(JSON.stringify(
                        {
                            type: 'conversation.item.create',
                            item: {
                                type: "function_call_output",
                                output: status,
                                call_id: callId,
                            }
                        }
                    ));

                } else if (functionName === "get_available_devices") {

                    const spotify = new SpotifyService(accessToken);
                    const devices = await spotify.getDevices();

                    const deviceData = devices.devices.map((device: any) => {
                        return {
                            id: device.id,
                            name: device.name,
                            type: device.type,
                            isActive: device.is_active,
                        }
                    })

                    this.openAIWebSocket.send(JSON.stringify(
                        {
                            type: 'conversation.item.create',
                            item: {
                                type: "function_call_output",
                                output: JSON.stringify(deviceData),
                                call_id: callId,
                            }
                        }
                    ));

                } else if (functionName === "pause") {

                    const spotify = new SpotifyService(accessToken);
                    await spotify.pause();

                    this.openAIWebSocket.send(JSON.stringify(
                        {
                            type: 'conversation.item.create',
                            item: {
                                type: "function_call_output",
                                output: "Paused",
                                call_id: callId,
                            }
                        }
                    ));

                } else if (functionName === "skip") {

                    const spotify = new SpotifyService(accessToken);
                    await spotify.skipToNext();

                    this.openAIWebSocket.send(JSON.stringify(
                        {
                            type: 'conversation.item.create',
                            item: {
                                type: "function_call_output",
                                output: "Skipped to next",
                                call_id: callId,
                            }
                        }
                    ));

                } else if (functionName === "previous") {

                    const spotify = new SpotifyService(accessToken);
                    await spotify.skipToPrevious();

                    this.openAIWebSocket.send(JSON.stringify(
                        {
                            type: 'conversation.item.create',
                            item: {
                                type: "function_call_output",
                                output: "Skipped to previous",
                                call_id: callId,
                            }
                        }
                    ));

                } else if (functionName === "add_to_queue") {

                    const { query, deviceId } = args;

                    const spotify = new SpotifyService(accessToken);
                    const results = await spotify.search(query, "track");

                    const track = results.tracks.items[0];
                    await spotify.addToQueue(track.uri, deviceId);
                    let status = `Added ${track.name} by ${track.artists[0].name} to queue`

                    this.openAIWebSocket.send(JSON.stringify(
                        {
                            type: 'conversation.item.create',
                            item: {
                                type: "function_call_output",
                                output: status,
                                call_id: callId,
                            }
                        }
                    ));

                }
            }

            else if (event.type === "conversation.item.input_audio_transcription.completed") {
                const transcript = event.transcript;


                io.to(accessToken).emit('input-transcript', transcript);
            }

            else if (event.type === "response.audio_transcript.delta") {
                const delta = event.delta;
                const responseId = event.response_id;

                console.log(`[transcript] ${delta}`);

                io.to(accessToken).emit('output-transcript-delta', { delta, responseId });
            }
        });
    }

    public deregisterOnMessageListener() {
        this.openAIWebSocket.removeAllListeners('message');
    }

    public sendAudio(base64Audio: string) {
        const event = {
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [{
                    type: 'input_audio',
                    audio: base64Audio,
                }]
            },
        };
        this.openAIWebSocket.send(JSON.stringify(event));
        this.openAIWebSocket.send(JSON.stringify(
            {
                type: 'response.create',
                response: {
                    tools: this.tools,
                }
            }
        ));

        console.log(`[server] Sent audio: ${base64Audio.length} bytes`);
    }

    public sendAudioChunk(base64Audio: string) {
        const event = {
            type: 'input_audio_buffer.append',
            audio: base64Audio,
        };

        console.log(`[server] Sent audio chunk: ${base64Audio.length} bytes`);

        this.openAIWebSocket.send(JSON.stringify(event));
    }
}