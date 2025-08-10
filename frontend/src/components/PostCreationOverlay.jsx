import React, { useState, useEffect } from 'react';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import { supabase } from '../supabaseClient';
import { CheckCircleFill } from 'react-bootstrap-icons';
import AudioRecorder from './AudioRecorder';

export default function PostCreationOverlay({ user, onPostSuccess }) {
    const [step, setStep] = useState('recording');
    const [audioData, setAudioData] = useState(null); // Correct state variable
    const [tag, setTag] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [processingStarId, setProcessingStarId] = useState(null);

    // FIX #1: This function now correctly sets the audioData state.
    const handleRecordingComplete = (data) => {
        setAudioData(data);
    };

    // This effect listens for the final result from the backend
    useEffect(() => {
        if (!processingStarId) return;

        const channel = supabase
            .channel(`star-processing:${processingStarId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'stars',
                    filter: `id=eq.${processingStarId}`,
                },
                (payload) => {
                    const updatedStar = payload.new;

                    if (updatedStar.status === 'approved') {
                        setStep('approved');
                    } else if (updatedStar.status === 'rejected') {
                        if (updatedStar.rejection_reason === 'low_confidence') {
                            setError("Please try again. Say something meaningful.");
                        } else {
                            setError("Your message was flagged for violating content policy. Please try again.");
                        }
                        setStep('recording');
                        setIsSubmitting(false);
                        setProcessingStarId(null);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [processingStarId, onPostSuccess]);

    // This new effect handles the 2-second success animation before redirecting.
    useEffect(() => {
        if (step === 'approved') {
            const timer = setTimeout(() => {
                onPostSuccess();
            }, 2000); // Wait 2 seconds

            return () => clearTimeout(timer);
        }
    }, [step, onPostSuccess]);
    
    const handleSubmit = async () => {
        // FIX #2: Checks for the correct 'audioData' variable.
        if (!tag || !audioData) { 
            setError("Please record a message and select a tag."); 
            return; 
        }
        setIsSubmitting(true);
        setError('');

        try {
            if (!user) throw new Error("User not found.");

            const { data: newStar, error: insertError } = await supabase
                .from('stars')
                .insert({ tag: tag, status: 'processing' })
                .select()
                .single();

            if (insertError) throw insertError;

            setProcessingStarId(newStar.id);
            setStep('processing');

            // FIX #3: The file path now correctly uses the star's ID, not the user's ID.
            const extension = audioData.mimeType.startsWith('audio/mp4') ? 'mp4' : 'webm';
            const fileName = `${newStar.id}/audio.${extension}`;

            const { error: uploadError } = await supabase.storage
                .from('audio-notes')
                .upload(fileName, audioData.blob); 
            
            if (uploadError) {
                await supabase.from('stars').delete().eq('id', newStar.id);
                throw uploadError;
            }

            const { data: urlData } = supabase.storage
                .from('audio-notes')
                .getPublicUrl(fileName);

            await supabase
                .from('stars')
                .update({ audio_url: urlData.publicUrl })
                .eq('id', newStar.id);

        } catch (err) {
            console.error("Error creating star:", err);
            setError(err.message);
            setIsSubmitting(false);
            setStep('recording');
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 'processing':
                return (
                    <div className="text-center p-5">
                        <Spinner animation="border" variant="light" />
                        <p className="mt-3 text-white-50">Analyzing your star... This may take a moment.</p>
                    </div>
                );
            
            case 'approved':
                return (
                    <div className="text-center p-5">
                        <CheckCircleFill size={50} className="text-success" />
                        <h3 className="mt-3 text-white">Approved!</h3>
                    </div>
                );
            
            case 'recording':
            default:
                return (
                    <>
                        <h3 className="fw-bold">Share Your Story</h3>
                        <p className="text-white-50">Record a short voice note, add a tag, and send it to the sky.</p>
                        
                        <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                        
                        <Form.Group className="my-3">
                            <Form.Label>Choose a Constellation</Form.Label>
                            <Form.Select onChange={(e) => setTag(e.target.value)} required disabled={isSubmitting}>
                                <option value="">Select a tag...</option>
                                <option value="Anxiety">Anxiety</option>
                                <option value="Burnout">Burnout</option>
                                <option value="SmallWin">Small Win</option>
                            </Form.Select>
                        </Form.Group>

                        {error && <Alert variant="danger" className="mt-3 py-2">{error}</Alert>}
                        
                        <div className="d-grid mt-4">
                            <Button 
                                variant="primary" 
                                size="lg" 
                                onClick={handleSubmit} 
                                // FIX #2 (again): Checks for the correct 'audioData' variable.
                                disabled={!audioData || !tag || isSubmitting}
                            >
                                {isSubmitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Send to the Sky'}
                            </Button>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="min-vh-100 position-relative d-flex align-items-center justify-content-center text-white" style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0f0f23 100%)' }}>
            <div className="position-absolute top-0 start-0 w-100 h-100 backdrop-blur" style={{ backgroundImage: 'url(/blurry-sky-background.jpg)', backgroundSize: 'cover' }}></div>
            <div className="glass-card p-4 p-md-5 rounded-3" style={{ zIndex: 1, width: '100%', maxWidth: '500px' }}>
                {renderStepContent()}
            </div>
        </div>
    );
}