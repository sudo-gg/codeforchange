import { Link } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';

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

export default function LandingPage() {
  const [stars, setStars] = useState([]);
    const clickedpfp = '../../images.jpeg';
    const soundSrc = '../../vine-boom.mp3';
    const [isClicked, setIsClicked] = useState(false);
    const [opacity, setOpacity] = useState(0);
  
    const audioRef = useRef(null);
  
    const handlepfpClick = () => {
      setIsClicked(true);
      const audio = new Audio(soundSrc);
      audio.play();
    };
    
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
  return (
    <>
    <div className="position-absolute top-0 start-0 w-100 h-100">
          {stars.map((star) => (
            <Star key={star.id} {...star} />
          ))}
        </div>
    <div className="bg-dark min-vh-100 d-flex flex-column">
      {/* Navbar */}
      <nav className="navbar navbar-expand-md navbar-dark bg-dark border-bottom border-secondary px-4">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(90deg, #a78bfa, #2563eb)',
              cursor: "pointer",
              borderRadius: 8
            }} 
            onClick={() => {
              setIsClicked(true);
              handlepfpClick();
            }}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}>
              <img src={clickedpfp} alt="Profile" className="img-fluid rounded-circle" style={{ width: '100%', height: '100%' }} opacity={opacity}/>
            </div>
            <span className="fw-bold fs-4">Elevate</span>
          </Link>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav ms-auto mb-2 mb-md-0">
              <li className="nav-item">
                <Link className="nav-link" to="/how-it-works">How It Works</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/features">Features</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/blog">Blog</Link>
              </li>
            </ul>
            <div className="d-flex ms-md-3 gap-2">
              <Link to="/login" className="btn btn-outline-light btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero */}
      <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-center px-3">
        <div className="mb-3">
          <span className="badge bg-secondary bg-opacity-75 text-light fs-6 px-3 py-2">
            See what others have to say... <Link to="/blog" className="text-white text-decoration-underline ms-1">Read More →</Link>
          </span>
        </div>
        <h1 className="display-3 fw-bold text-light mb-4" style={{ textShadow: '0 2px 16px #0008' }}>
          Welcome to Elevate! <br className="d-none d-sm-block" />
          <span style={{
            background: 'linear-gradient(90deg, #a78bfa, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            A galaxy of help.
          </span>
        </h1>
        <p className="lead text-secondary mb-5 mx-auto" style={{ maxWidth: 600 }}>
          Explore a whole universe of peoples thoughts who can offer words of wisdom.
        </p>
        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center mb-5">
          <Link to="/register" className="btn btn-primary btn-lg px-5">Get Started — Free</Link>
          <Link to="/how-it-works" className="btn btn-outline-light btn-lg px-5 d-flex align-items-center gap-2">
            <svg width="20" height="20" fill="currentColor"><rect width="20" height="20" rx="4" fill="white" /><polygon points="7,5 15,10 7,15" fill="#6366f1" /></svg>
            Watch Video
          </Link>
        </div>
      </main>
    </div>
    </>
  );
}