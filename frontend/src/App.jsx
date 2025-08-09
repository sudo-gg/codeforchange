// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Layout from './components/Layout'; // You will need this wrapper for logged-in pages

// Import your pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/login';
import SignUpPage from './pages/signup';
import NightSkyPage from './pages/NightSkyPage';
// import DashboardPage from './pages/DashboardPage'; // Assuming you'll create this

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-vh-100 bg-dark"></div>; // Simple loading screen
  }

  return (
    <Router>
      <Routes>
        {/* Public routes that everyone can see */}
        <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/sky" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignUpPage />} />

        {/* Protected routes that only logged-in users can see */}
        <Route element={session ? <Layout /> : <Navigate to="/login" />}>
          {/* Pass the session object as a prop */}
          <Route path="/sky" element={<NightSkyPage session={session} />} />
          { /* <Route path="/dashboard" element={<DashboardPage />} /> */ }
      </Route>
      </Routes>
    </Router>
  );
}