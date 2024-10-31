import { useEffect, useState } from 'react'
import { socket } from '../socket'

export default function Transcript() {
    const [transcript, setTranscript] = useState<{
        text: string,
        role: "user" | "bot"
    }[]>([]);

    const [currentResponseId, setCurrentResponseId] = useState<string | null>(null);

    useEffect(() => {
        socket.on('input-transcript', (data) => {
            setTranscript(transcript => [...transcript, { text: data, role: "user" }]);
        });
        socket.on('output-transcript-delta', (data) => {
            const { delta, responseId } = data;

            if (responseId === currentResponseId) {
                // Find the last bot response and update it

                const lastBotResponseIndex = [...transcript].reverse().findIndex((item) => item.role === "bot");
                setTranscript(
                    transcript => [
                        ...transcript.slice(0, lastBotResponseIndex),
                        {
                            text: transcript[transcript.length - 1].text + delta,
                            role: "bot"
                        },
                        ...transcript.slice(lastBotResponseIndex + 1)
                    ]
                );
            } else {
                setCurrentResponseId(responseId);
                setTranscript(transcript => [...transcript, { text: delta, role: "bot" }]);
            }

        });

        return () => {
            socket.off('input-transcript');
            socket.off('output-transcript-delta');
        }
    }, [currentResponseId])

    return (
        <div className="w-1/2 bg-[#c8c8c8] m-auto mt-32 p-6 rounded-lg flex flex-col gap-5 h-96 max-h-96 overflow-scroll">
            <pre className="font-bold">Voice transcript</pre>
            {
                transcript.map((item) =>
                    <pre
                        className={`${item.role === "bot" ? "text-left" : "text-right ml-auto"} text-wrap w-1/2`}
                    >
                        {item.text}
                    </pre>)
            }
        </div>
    )
}
