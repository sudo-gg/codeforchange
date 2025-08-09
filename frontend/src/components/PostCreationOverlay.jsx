import React, { useState } from 'react';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import { supabase } from '../supabaseClient';
import { CheckCircleFill } from 'react-bootstrap-icons';
import AudioRecorder from './AudioRecorder';

export default function PostCreationOverlay({ user, onPostSuccess }) {
    const [step, setStep] = useState('recording');
    const [audioBlob, setAudioBlob] = useState(null);
    const [tag, setTag] = useState('');
    const [error, setError] = useState('');

    const handleRecordingComplete = (blob) => {
        setAudioBlob(blob);
    };
    
    /**
     * Confirms the user's audio recording. If no recording is present,
     * show an error message. If there is a recording, start the verification
     * process, which takes a few seconds. After 2.5 seconds, move on to the
     * tagging step.
     */
    const handleConfirmAudio = () => {
        if (!audioBlob) {
            // If the user hasn't recorded an audio yet, show an error message
            setError("Please record a message first.");
            return;
        }
        // Start the verification process
        setStep('verifying');
        setError('');
        // Move on to the tagging step after 2.5 seconds
        setTimeout(() => setStep('tagging'), 2500);
    };

    const handleSubmit = async () => {
        if (!tag) { 
            setError("Please select a tag."); 
            return; 
        }
        setStep('sending');
        setError('');

        try {
            if (!user) throw new Error("User not found.");

            const fileName = `${user.id}/${Date.now()}.webm`;
            const { error: uploadError } = await supabase.storage.from('audio-notes').upload(fileName, audioBlob);
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from('audio-notes').getPublicUrl(fileName);

            const { data: newStar, error: insertError } = await supabase
                .from('stars')
                .insert({
                    user_id: user.id,
                    audio_url: urlData.publicUrl,
                    tag: tag,
                    status: 'pending'
                })
                .select()
                .single();

            if (insertError) throw insertError;
            
            await supabase
                .from('stars')
                .update({ status: 'approved' })
                .eq('id', newStar.id);
            
            onPostSuccess();

        } catch (err) {
            console.error("Error creating star:", err);
            setError(err.message);
            setStep('tagging');
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 'recording': return (<>
                <h3 className="fw-bold">Share Your Story</h3>
                <p className="text-white-50">Record a short voice note. Your post for today.</p>
                <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                {error && <Alert variant="warning" className="mt-3 py-2">{error}</Alert>}
                <div className="mt-4">
                    <Button variant="primary" size="lg" onClick={handleConfirmAudio} disabled={!audioBlob}>
                        Confirm Recording
                    </Button>
                </div>
            </>);
            case 'verifying': return (<div className="text-center p-5"><Spinner animation="border" variant="light" /><p className="mt-3 text-white-50">Verifying your audio...</p></div>);
            case 'tagging': return (<>
                <div className="text-center text-success mb-3"><CheckCircleFill size={40} /><p className="mt-2 mb-0">Audio verified!</p></div>
                <h3 className="fw-bold">Final Step</h3><p className="text-white-50">Add a tag to place your star in a constellation.</p>
                <Form.Group>
                    <Form.Label>Choose a Constellation</Form.Label>
                    <Form.Select onChange={(e) => setTag(e.target.value)} required>
                        <option value="">Select a tag...</option>
                        <option value="Anxiety">Anxiety</option><option value="Burnout">Burnout</option><option value="SmallWin">Small Win</option>
                    </Form.Select>
                </Form.Group>
                {error && <Alert variant="danger" className="mt-3 py-2">{error}</Alert>}
                <div className="d-flex justify-content-between mt-4">
                    <Button variant="outline-secondary" onClick={() => setStep('recording')}>Go Back</Button>
                    <Button variant="primary" size="lg" onClick={handleSubmit}>Send</Button>
                </div>
            </>);
            case 'sending': return (<div className="text-center p-5"><Spinner animation="grow" variant="primary" /><p className="mt-3 text-white-50">Sending your star to the sky...</p></div>);
            default: return null;
        }
    };

    return (
        <div className="min-vh-100 position-relative d-flex align-items-center justify-content-center text-white" style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0f0f23 100%)' }}>
            <div className="position-absolute top-0 start-0 w-100 h-100 backdrop-blur" style={{ backgroundImage: 'url(/blurry-sky-background.jpg)', backgroundSize: 'cover' }}></div>
            <div className="glass-card p-4 p-md-5 rounded-3" style={{ zIndex: 1, width: '100%', maxWidth: '500px' }}>{renderStepContent()}</div>
        </div>
    );
}