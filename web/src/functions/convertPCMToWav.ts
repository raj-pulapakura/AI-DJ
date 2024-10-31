import { writeString } from './writeString';

export const convertPCMToWav = (base64: string, sampleRate: number, bitDepth: number): ArrayBuffer => {
    const binaryString = atob(base64);
    const pcmData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        pcmData[i] = binaryString.charCodeAt(i);
    }

    const wavBuffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(wavBuffer);

    // Write WAV header
    writeString(view, 0, 'RIFF'); // ChunkID
    view.setUint32(4, 36 + pcmData.length, true); // ChunkSize
    writeString(view, 8, 'WAVE'); // Format
    writeString(view, 12, 'fmt '); // Subchunk1ID
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true); // NumChannels (1 for mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * bitDepth / 8, true); // ByteRate
    view.setUint16(32, bitDepth / 8, true); // BlockAlign
    view.setUint16(34, bitDepth, true); // BitsPerSample
    writeString(view, 36, 'data'); // Subchunk2ID
    view.setUint32(40, pcmData.length, true); // Subchunk2Size

    // Write PCM data
    new Uint8Array(wavBuffer, 44).set(pcmData);

    return wavBuffer;
};