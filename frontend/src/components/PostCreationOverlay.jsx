import React, { useState, useEffect } from 'react';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import { supabase } from '../supabaseClient';
import { CheckCircleFill } from 'react-bootstrap-icons'; // Import the checkmark icon
import AudioRecorder from './AudioRecorder';

export default function PostCreationOverlay({ user, onPostSuccess }) {
    const [step, setStep] = useState('recording');
    const [audioBlob, setAudioBlob] = useState(null);
    const [tag, setTag] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [processingStarId, setProcessingStarId] = useState(null);

    const handleRecordingComplete = (blob) => {
        setAudioBlob(blob);
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
                        // CHANGE #1: Instead of redirecting, go to the 'approved' step.
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
    }, [processingStarId]);

    // CHANGE #2: This new effect handles the 2-second success animation before redirecting.
    useEffect(() => {
        if (step === 'approved') {
            const timer = setTimeout(() => {
                onPostSuccess();
            }, 2000); // Wait 2 seconds

            // Cleanup the timer if the component unmounts
            return () => clearTimeout(timer);
        }
    }, [step, onPostSuccess]);
    
    const handleSubmit = async () => {
        if (!tag || !audioBlob) { 
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

            const fileName = `${newStar.id}/audio.webm`;
            const { error: uploadError } = await supabase.storage
                .from('audio-notes')
                .upload(fileName, audioBlob);
            
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
        // I've converted your if/return to a switch statement to cleanly handle the new 'approved' state.
        switch (step) {
            case 'processing':
                return (
                    <div className="text-center p-5">
                        <Spinner animation="border" variant="light" />
                        <p className="mt-3 text-white-50">Analyzing your star... This may take a moment.</p>
                    </div>
                );
            
            // CHANGE #3: A new UI state for the success animation.
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
                                <option value="Depression">Depression</option>
                                <option value="Success">Success</option>
                                <option value="Stress">Stress</option>
                                <option value="Loneliness">Loneliness</option>
                                <option value="Grief">Grief</option>
                                <option value="Anger">Anger</option>
                                <option value="Sadness">Sadness</option>
                                <option value="FrontEndDevelopment">Front-End Development</option>
                                <option value={"Other"}>Other</option>
                            </Form.Select>
                        </Form.Group>

                        {error && <Alert variant="danger" className="mt-3 py-2">{error}</Alert>}
                        
                        <div className="d-grid mt-4">
                            <Button 
                                variant="primary" 
                                size="lg" 
                                onClick={handleSubmit} 
                                disabled={!audioBlob || !tag || isSubmitting}
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