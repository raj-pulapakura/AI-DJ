import { useEffect, useRef } from 'react'
import { convertPCMToWav } from '../functions/convertPCMToWav';
import { socket } from '../socket';

export default function AudioPlayer({ setIsPlaying }: { setIsPlaying: (isPlaying: boolean) => void }) {
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const base64ChunksRef = useRef<string[]>([]); // Buffer to hold all base64 chunks

    useEffect(() => {
        audioContextRef.current = new AudioContext();

        console.log("Setting up socket listeners");
        socket.on('connect', () => console.log("Connected"));
        socket.on('disconnect', () => console.log('Disconnected'));
        socket.on('audio', (data) => {
            base64ChunksRef.current.push(data);
        });
        socket.on('audio_complete', () => {
            decodeAndPlayAudio();
        })

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('audio');
            socket.off('audio_complete');
        }
    }, [])

    useEffect(() => {
        socket.auth = { token: localStorage.getItem('access_token') };
        socket.connect();
    }, [])

    const decodeAndPlayAudio = async () => {
        // Concatenate all base64 chunks into a single base64 string
        const base64String = base64ChunksRef.current.join('');
        base64ChunksRef.current = []; // Clear chunks after concatenation

        // Decode the base64 string into audio
        try {

            const audioData = convertPCMToWav(base64String, 24000, 16);

            // Decode audio data and play it
            try {
                const audioBuffer = await audioContextRef.current?.decodeAudioData(audioData);

                if (audioBuffer) {
                    playBuffer(audioBuffer);
                }
            } catch (error) {
                console.error('Audio decode error:', error);
            }

        } catch (error) {
            console.error('Base64 decode error:', error);
        }
    };

    const playBuffer = (audioBuffer: AudioBuffer) => {
        if (audioContextRef.current) {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();
            setIsPlaying(true);
            source.onended = () => {
                sourceNodeRef.current = null;
                setIsPlaying(false);
            };
            sourceNodeRef.current = source;
        }
    };

    return null;
}
