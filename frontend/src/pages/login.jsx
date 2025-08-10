import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Card, Spinner, Alert } from "react-bootstrap";
import React from "react";

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

function ShootingStar({
  top,
  width,
  height,
  duration,
  translateX,
  translateY,
}) {
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
      if (Math.random() < 0.1) {
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/sky"); // Redirect to the night sky after login
    }
    setLoading(false);
  };

  return (
    <>
      <style>
        {`
          @keyframes twinkle {
      0%, 100% { opacity: 0.2; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    @keyframes shootingStar {
      0% {
      transform: translateX(0) translateY(0);
      opacity: 1;
      }
      70% {
      opacity: 1;
      }
      100% {
      transform: translateX(-120vw) translateY(20vh);
      opacity: 0;
      }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.8; }
      50% { transform: scale(1.05); opacity: 1; }
      }
      `}
      </style>
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{
          background:
            "radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0f0f23 100%)",
        }}
      >
        {/* Back Button */}
        <Button
          className="glass-card position-fixed text-white border-0 d-flex align-items-center"
          style={{
            top: "20px",
            left: "20px",
            zIndex: 1000,
            padding: "8px 12px",
            fontSize: "14px",
          }}
          onClick={() => navigate("/")}
        >
          <span style={{ marginRight: "6px" }}>←</span>
          Back
        </Button>


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
              <h2 className="fw-bold">Welcome Back</h2>
              <p className="text-white-50">Sign in to continue your journey</p>
            </div>

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="formPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              {error && (
                <Alert variant="danger" className="py-2">
                  {error}
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
                  "Sign In"
                )}
              </Button>
            </Form>

            <p className="text-center text-white-50 mt-4 mb-0">
              New to the cosmos?{" "}
              <Link to="/register" className="fw-medium text-white">
                Create an account
              </Link>
            </p>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
