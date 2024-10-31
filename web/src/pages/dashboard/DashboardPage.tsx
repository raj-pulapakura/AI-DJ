import { useState } from 'react'
import AudioCapture from '../../components/AudioCapture';
import { motion } from 'framer-motion';
import AudioPlayer from '../../components/AudioPlayer';
import Transcript from '../../components/Transcript';
import Commands from '../../components/Commands';


export default function DashboardPage() {

    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div>
            {
                isPlaying ?
                    <motion.div
                        style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "100%",
                            backgroundColor: "white",
                            border: "2px solid blue",
                            margin: "0 auto",
                            marginTop: "200px"
                        }}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1.8, 2, 1.8] }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut"
                        }}
                    >
                    </motion.div> : <motion.div
                        style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "100%",
                            backgroundColor: "blue",
                            border: "none",
                            margin: "0 auto",
                            marginTop: "200px"
                        }}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut"
                        }}
                    >
                    </motion.div>
            }

            <AudioCapture />
            <AudioPlayer setIsPlaying={setIsPlaying} />

            <div className="flex items-center justify-around">
                <Transcript />
                <Commands />
            </div>


        </div >
    )
}
