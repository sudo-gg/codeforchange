import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Spinner, Alert } from 'react-bootstrap';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/sky'); // Redirect to the night sky after login
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0f0f23 100%)' }}>
      
      <Card className="glass-card text-white p-4" style={{ zIndex: 1, width: '100%', maxWidth: '420px' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <h2 className="fw-bold">Welcome Back</h2>
            <p className="text-white-50">Sign in to continue your journey</p>
          </div>

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>
            
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}

            <Button variant="primary" type="submit" className="w-100 fw-bold py-2" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Sign In'}
            </Button>
          </Form>

          <p className="text-center text-white-50 mt-4 mb-0">
            New to the cosmos? <Link to="/register" className="fw-medium text-white">Create an account</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}