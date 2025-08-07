import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';

const Placeholder = ({ pageName }) => (
  <div className="d-flex align-items-center justify-content-center min-vh-100 bg-dark text-light">
    <div className="text-center">
      <h1 className="display-4 mb-4">{pageName} Page</h1>
      <p className="text-secondary">Coming soon...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Placeholder pageName="Login" />} />
        <Route path="/register" element={<Placeholder pageName="Register" />} />
        <Route path="/how-it-works" element={<Placeholder pageName="How It Works" />} />
        <Route path="/features" element={<Placeholder pageName="Features" />} />
        <Route path="/blog" element={<Placeholder pageName="Blog" />} />
      </Routes>
    </Router>
  );
}