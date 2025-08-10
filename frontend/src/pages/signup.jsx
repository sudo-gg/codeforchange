import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Card, Spinner, Alert } from "react-bootstrap";
import React from "react";

// Star components remain the same
const Star = ({ x, y, size, opacity, animationDelay }) => (
  <div
    className="position-absolute rounded-circle bg-white"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      opacity: opacity,
      animation: `pulse ${2 + Math.random() * 3}s infinite`,
      animationDelay: `${animationDelay}s`,
    }}
  />
);
function ShootingStar({ top, width, height, duration, translateX, translateY }) {
  return (
    <div
      style={{
        position: "fixed",
        left: "100vw",
        top,
        width,
        height,
        backgroundColor: "white",
        borderRadius: "50%",
        opacity: 0.7,
        animation: `shootingStar ${duration} linear forwards`,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "80px",
          height: "2px",
          background: "linear-gradient(to right, white, transparent)",
          transform: "translateY(-1px)",
        }}
      />
      <style>
        {`
          @keyframes shootingStar {
            0% {
              transform: translateX(0) translateY(0);
              opacity: 1;
            }
            100% {
              transform: translateX(${translateX}) translateY(${translateY});
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}

function ShootingStars() {
  const [stars, setStars] = React.useState([]);

  const spawnStar = () => {
    const newStar = {
      id: Date.now(),
      top: `${Math.random() * 100}vh`,
      width: `${Math.random() * 100 + 50}px`,
      height: `${Math.random() * 4 + 2}px`,
      duration: `${Math.random() * 2 + 2}s`,
      translateX: `${Math.random() * -150}vw`,
      translateY: `${Math.random() * 60 - 30}vh`,
    };
    setStars((prevStars) => [...prevStars, newStar]);
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance of spawning a new star
        spawnStar();
      }
    }, 1000); // check every 1 second
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {stars.map((star) => (
        <ShootingStar key={star.id} {...star} />
      ))}
    </>
  );

}

export default function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [stars, setStars] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const newStars = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.1,
      animationDelay: Math.random() * 5,
    }));
    setStars(newStars);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    // Pass the username in the options. The trigger will use this.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username, // Make sure your state variable is named 'username'
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // This is the only success message you need.
      setMessage(
        "Success! Check your email for a confirmation link to complete your registration."
      );
      setTimeout(() => navigate("/login"), 4000); // Navigate to login after showing message
    }
  };

  return (
    <>
      <style>
        {`
      @keyframes twinkle {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 1; }
}
    `}
      </style>
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0f0f23 100%)",
        }}
      >
        <div className="position-absolute top-0 start-0 w-100 h-100">
          {stars.map((star) => (
            <Star key={star.id} {...star} />
          ))}
        </div>
        <ShootingStars delay={3} />
        <Card
          className="glass-card text-white p-4"
          style={{ zIndex: 1, width: "100%", maxWidth: "420px" }}
        >
          <Card.Body>
            <div className="text-center mb-4">
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "linear-gradient(45deg, #2563eb, #a78bfa)",
                }}
              >
                
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  fill="currentColor"
                  className="bi bi-lightning-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641l2.5-8.5z" />
                </svg>
              </div>
              <h2 className="fw-bold">Begin Your Journey</h2>
              <p className="text-white-50">
                Create your account for wellness among the stars
              </p>
            </div>

            <Form onSubmit={handleSignup}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Choose your stellar identity"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="your.cosmic@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Create a secure password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formConfirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Confirm your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Form.Group>

              {error && (
                <Alert variant="danger" className="py-2">
                  {error}
                </Alert>
              )}
              {message && (
                <Alert variant="success" className="py-2">
                  {message}
                </Alert>
              )}

              <Button
                variant="primary"
                type="submit"
                className="w-100 fw-bold py-2"
                disabled={loading}
              >
                {loading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                ) : (
                  "Start Your Cosmic Journey"
                )}
              </Button>
            </Form>

            <p className="text-center text-white-50 mt-4 mb-0">
              Already exploring the cosmos?{" "}
              <Link to="/login" className="fw-medium text-white">
                Return to your stellar sanctuary
              </Link>
            </p>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
