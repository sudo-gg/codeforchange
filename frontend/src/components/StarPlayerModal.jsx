import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { HeartFill, PlayFill, PauseFill } from 'react-bootstrap-icons';
import { supabase } from '../supabaseClient';

export default function StarPlayerModal({ star, show, onHide, onStarAppreciated }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAppreciated, setIsAppreciated] = useState(false);
    const [isOwnStar, setIsOwnStar] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const audioRef = useRef(null);
    const canvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const animationFrameRef = useRef(null);

    // This useEffect only fetches the INITIAL status when the modal opens.
    useEffect(() => {
        const checkInitialStatus = async () => {
            // Reset state for any new star being shown
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.currentTime = 0;

            if (!star || !show) return;

            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsOwnStar(false);
                    setIsAppreciated(false);
                    return;
                };

                const isOwner = star.user_id === user.id;
                setIsOwnStar(isOwner);

                if (isOwner) {
                    setIsAppreciated(false);
                } else {
                    const { data, error } = await supabase
                        .from('appreciations')
                        .select('star_id')
                        .eq('star_id', star.id)
                        .eq('user_id', user.id)
                        .maybeSingle();
                    
                    if (error) throw error;
                    setIsAppreciated(!!data);
                }
            } catch (error) {
                console.error("Error checking star status:", error);
                setIsAppreciated(false); // Default to a safe state
            } finally {
                setIsLoading(false);
            }
        };

        checkInitialStatus();
        
        // Cleanup function for audio visualizer
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.audioContext.close().catch(() => {});
            animationFrameRef.current = null;
            audioContextRef.current = null;
        };

    // This effect runs only when the modal is opened for a specific star.
    }, [star?.id, show]);


    const handleAppreciate = async () => {
        if (!star || isLoading || isOwnStar) return;

        // Check for user session.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("You must be logged in to appreciate a star.");
            return;
        }

        // 1. Immediately update the UI
        const previouslyAppreciated = isAppreciated;
        setIsAppreciated(!previouslyAppreciated);

        // 2. Determine which RPC function to call.
        const functionToCall = previouslyAppreciated ? 'unappreciate_star' : 'appreciate_star';
        const params = previouslyAppreciated 
            ? { star_id_to_remove: star.id } 
            : { star_id_to_add: star.id };

        // 3. Perform the database action in the background by calling the function.
        try {
            const { error } = await supabase.rpc(functionToCall, params);

            if (error) {
                // If the database call fails, throw an error to be caught below.
                throw error;
            }
            
            // 4. Notify the parent to update UI counts, WITHOUT a full refresh.
            if (onStarAppreciated) {
                onStarAppreciated({ appreciated: !previouslyAppreciated });
            }

        } catch (error) {
            console.error(`Error with RPC call ${functionToCall}:`, error);
            
            // If the database fails, revert the UI back to its original state.
            setIsAppreciated(previouslyAppreciated);
            alert("Could not update appreciation. Please try again.");
        }
    };

    // --- Audio Visualizer and Playback Controls (Unchanged) ---
    
    const setupAudioVisualizer = () => {
        if (!audioRef.current || audioContextRef.current) return;
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audioRef.current);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser).connect(audioContext.destination);
        audioContextRef.current = { audioContext, analyser, source };

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let smoothedData = new Array(bufferLength).fill(128);
        const smoothingFactor = 0.15;

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#a78bfa';
            ctx.beginPath();
            const sliceWidth = canvas.width / bufferLength;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                smoothedData[i] += (dataArray[i] - smoothedData[i]) * smoothingFactor;
                const v = smoothedData[i] / 128.0;
                const y = v * canvas.height / 2;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                x += sliceWidth;
            }
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        };
        draw();
    };

    const handlePlayPause = () => {
        if (!audioRef.current) return;

        // FIX: Setup the visualizer FIRST, before playing.
        // This ensures the AudioContext is created inside the user's click event.
        if (!audioContextRef.current) {
            setupAudioVisualizer();
        }

        // Now, toggle play/pause
        if (audioRef.current.paused) {
            // We also explicitly resume the context, which is a best practice for Safari.
            audioContextRef.current?.audioContext.resume();
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.currentTime = 0;
    };

    if (!star) return null;

    return (
        <Modal show={show} onHide={onHide} centered dialogClassName="glass-modal">
            <Modal.Header closeButton>
                <Modal.Title>A Voice from the Cosmos</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-white-50">From: <span className="fw-bold text-white">{star.users?.username || 'Anonymous'}</span></p>
                <p className="text-white-50">Constellation: <span className="badge bg-primary">{star.tag}</span></p>

                <audio
                    ref={audioRef}
                    src={star.audio_url}
                    crossOrigin="anonymous"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={handleAudioEnded}
                />
                <canvas ref={canvasRef} width="460" height="100" style={{ display: 'block', margin: '1rem auto' }} />
                <div className="d-flex justify-content-center my-3">
                    <Button variant="outline-light" onClick={handlePlayPause} className="rounded-circle" style={{ width: '70px', height: '70px' }}>
                        {isPlaying ? <PauseFill size={40} /> : <PlayFill size={40} />}
                    </Button>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant={isAppreciated ? "success" : "primary"}
                    onClick={handleAppreciate}
                    disabled={isLoading || isOwnStar}
                    className="hvr-grow"
                >
                    <HeartFill className="me-2" />
                    {isAppreciated ? "Appreciated" : "Appreciate"}
                </Button>
                <Button variant="secondary" onClick={onHide} className="hvr-grow">Close</Button>
            </Modal.Footer>
        </Modal>
    );
}