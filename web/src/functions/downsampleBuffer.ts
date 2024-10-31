// Utility to downsample audio to 24kHz
export function downsampleBuffer(buffer: Float32Array, sampleRate: number, targetRate: number) {
    if (sampleRate === targetRate) return buffer;
    const ratio = sampleRate / targetRate;
    const length = Math.round(buffer.length / ratio);
    const downsampled = new Float32Array(length);
    for (let i = 0; i < length; i++) {
        downsampled[i] = buffer[Math.round(i * ratio)];
    }
    return downsampled;
}