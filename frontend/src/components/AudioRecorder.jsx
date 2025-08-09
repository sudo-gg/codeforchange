// src/components/AudioRecorder.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Mic, StopCircle } from 'react-bootstrap-icons';

const prompts = [
  "What's on your mind right now?",
  "What went well today?",
  "Share a challenge you overcame.",
  "What are you grateful for?",
];

export default function AudioRecorder({ onRecordingComplete }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(prompts[0]);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);

  // Cycle through prompts
  useEffect(() => {
    const promptInterval = setInterval(() => {
      setCurrentPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    }, 4000);
    return () => clearInterval(promptInterval);
  }, []);

  const startRecording = async () => {
    setAudioURL('');
    audioChunksRef.current = [];

    try {
      // 1. Get user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);

      // Detect supported mime type
      let mimeType = '';
      if (window.MediaRecorder && MediaRecorder.isTypeSupported) {
        if (MediaRecorder.isTypeSupported('audio/mp4;codecs=aac')) {
          mimeType = 'audio/mp4;codecs=aac';
        } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else {
          console.warn('No supported mime type found');
          mimeType = '';
        }
      }

      // 2. Create a new MediaRecorder instance with detected mimeType
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      // 3. Store audio chunks when they become available
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // 4. When recording stops, create a blob and URL
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setIsRecording(false);
        // 5. Pass the raw audio data (the blob) to the parent component
        onRecordingComplete(audioBlob);
      };

      // 6. Start recording
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error starting recording:", err);
      // You could also set an error state here to show the user
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };
  
  // The visualize() function and return JSX remain the same.
  // Make sure they are included in your final file.
  const visualize = () => {
    if (!audioRef.current || !canvasRef.current) return;
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaElementSource(audioRef.current);
        const analyser = audioContextRef.current.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioContextRef.current.destination);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        const draw = () => {
            requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);
            ctx.clearRect(0, 0, WIDTH, HEIGHT); // Use clearRect for transparency
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#a78bfa';
            ctx.beginPath();
            const sliceWidth = WIDTH * 1.0 / bufferLength;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * HEIGHT / 2;
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                x += sliceWidth;
            }
            ctx.lineTo(WIDTH, HEIGHT / 2);
            ctx.stroke();
        };
        draw();
    }
  };

  return (
    <div className="text-center p-3">
      {!isRecording && !audioURL && (
        <>
          <p className="text-white-50 mb-3 fst-italic fade-in-out" style={{height: '2rem'}}>{currentPrompt}</p>
          <Button variant="primary" onClick={startRecording} className="rounded-circle" style={{width: 70, height: 70}}>
            <Mic size={30} />
          </Button>
        </>
      )}
      {isRecording && (
        <>
          <p className="text-white-50 mb-3 fst-italic" style={{height: '2rem'}}>Recording...</p>
          <Button variant="danger" onClick={stopRecording} className="rounded-circle" style={{width: 70, height: 70}}>
            <StopCircle size={30} />
          </Button>
        </>
      )}
      {audioURL && !isRecording && (
        <div className="d-flex flex-column align-items-center gap-3">
          <audio ref={audioRef} src={audioURL} onPlay={visualize} controls />
          <canvas ref={canvasRef} width="300" height="70" />
          <Button variant="outline-light" size="sm" onClick={startRecording}>Record Again</Button>
        </div>
      )}
    </div>
  );
}