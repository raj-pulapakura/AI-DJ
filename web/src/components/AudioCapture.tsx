import axios from 'axios';
import { useEffect } from "react";
import { downsampleBuffer } from '../functions/downsampleBuffer';



function AudioCapture() {
    useEffect(() => {
        const initAudioStream = async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new AudioContext({ sampleRate: 24000 });
            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(16384, 1, 1);

            processor.onaudioprocess = (event) => {
                const inputBuffer = event.inputBuffer.getChannelData(0); // Mono channel
                const downsampledBuffer = downsampleBuffer(inputBuffer, audioContext.sampleRate, 24000);

                // Convert to PCM (16-bit)
                const pcmData = new Int16Array(downsampledBuffer.length);
                for (let i = 0; i < downsampledBuffer.length; i++) {
                    pcmData[i] = Math.max(-1, Math.min(1, downsampledBuffer[i])) * 32767;
                }

                const pcmBlob = new Blob([pcmData.buffer], { type: "audio/pcm" });

                // Send PCM data to server
                axios.post('/api/audio-stream', pcmBlob, {
                    headers: {
                        'Content-Type': 'audio/pcm',
                    },
                })
            };

            source.connect(processor);
            processor.connect(audioContext.destination); // Needed to keep the processor alive
        };

        initAudioStream();
    }, []);

    return null;
}

export default AudioCapture;
