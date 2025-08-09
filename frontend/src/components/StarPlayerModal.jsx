// src/components/StarPlayerModal.jsx
import { Modal, Button } from 'react-bootstrap';

export default function StarPlayerModal({ star, show, onHide }) {
  if (!star) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>A Star's Story</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>From: <span className="fw-bold">{star.users?.username || 'Anonymous'}</span></p>
        <p>Constellation: <span className="badge bg-primary">{star.tag}</span></p>
        <audio src={star.audio_url} controls autoPlay className="w-100 mt-3">
          Your browser does not support the audio element.
        </audio>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}