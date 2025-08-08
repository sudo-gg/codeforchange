// import appnavbar from '../components/appnavbar';
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { supabase } from '../supabaseClient';
import '../dashboard.css';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [stars, setStars] = useState([]);
    const [error, setError] = useState(null);
    const [user_id, setUser_id] = useState(null);


    useEffect(() => {
  const getUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error(error)
      return
    }
    console.log(user);
    setUser_id(user?.id);
  }

  getUser()
}, [])
    useEffect(() => {
        // Fetches the user's profile information
        const fetchUserData = async () => {

            const { data, error } = await supabase
                .from('users')
                .select('user_id, username, karma_score')

            if (error) {
                setError(error.message);
                console.error('Error fetching user data:', error);
            } else {
                setUser(data);
            }
        };

        // Fetches the audio upload dates
        const fetchStars = async () => {
            console.log("MERFDSFSADFDSAFD", user_id);
            const { data, error } = await supabase
                .from('stars')
                .select('created_at')
                .eq('user_id', user_id);

            if (error) {
                setError(error.message);
                console.error('Error fetching stars:', error);
            } else {
                setStars(data);
            }
        };

        fetchUserData();
        fetchStars();
    }, [user_id]);

    // Formats the fetched star dates for the calendar
    const getStarDates = () => {
        return stars.map(star => new Date(star.created_at).toDateString());
    };

    // Applies a custom class to calendar tiles that have an audio upload
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const starDates = getStarDates();
            if (starDates.includes(date.toDateString())) {
                return 'star-day';
            }
        }
        return null;
    };

    return (
        <div className="dashboard">
            <div className="stars-bg"></div>
            <div className="stars-bg-2"></div>
            <div className="stars-bg-3"></div>
            <div className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Dashboard</h1>
                    {error && <p className="error-message">Error: {error}</p>}
                </header>
                <main className="dashboard-main">
                    <div className="user-info">
                        <h2>Welcome, {user ? user.username : '...'}</h2>
                        <p>Karma: {user ? user.karma : '...'}</p>
                    </div>
                    <div className="calendar-container">
                        <h2>Your Audio Uploads</h2>
                        <Calendar
                            tileClassName={tileClassName}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}