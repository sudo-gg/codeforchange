// src/hooks/useAudioPlayer.js
import { useState, useRef, useEffect } from 'react';

// This is our reusable logic
export function useAudioPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Cleanup function to run when the component using this hook unmounts
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.audioContext.close();
            }
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    const setupAudioVisualizer = () => {
        if (!audioRef.current || !canvasRef.current || audioContextRef.current) return;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audioRef.current);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser).connect(audioContext.destination);
        audioContextRef.current = { audioContext };

        const ctx = canvasRef.current.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let smoothedData = new Array(bufferLength).fill(128);
        const smoothingFactor = 0.15;

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#a78bfa';
            ctx.beginPath();
            const sliceWidth = canvasRef.current.width / bufferLength;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                smoothedData[i] += (dataArray[i] - smoothedData[i]) * smoothingFactor;
                const v = smoothedData[i] / 128.0;
                const y = v * canvasRef.current.height / 2;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                x += sliceWidth;
            }
            ctx.lineTo(canvasRef.current.width, canvasRef.current.height / 2);
            ctx.stroke();
        };
        draw();
    };

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (audioRef.current.paused) {
            audioRef.current.play();
            if (!audioContextRef.current) setupAudioVisualizer();
        } else {
            audioRef.current.pause();
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    // The hook returns the state and functions the component will need
    return {
        isPlaying,
        audioRef,
        canvasRef,
        handlePlayPause,
        handleAudioEnded,
        setIsPlaying
    };
}