import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import PostCreationOverlay from '../components/PostCreationOverlay';
import NightSkyCanvas from '../components/NightSkyCanvas';
import StarPlayerModal from '../components/StarPlayerModal';

export default function NightSkyPage({ session }) {
    const [loading, setLoading] = useState(true);
    const [hasPostedToday, setHasPostedToday] = useState(false);
    const [stars, setStars] = useState([]);
    const [selectedStar, setSelectedStar] = useState(null); // 2. Add state for the selected star
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleStarClick = (star) => {
        setSelectedStar(star);
        setIsModalOpen(true);
    };

    const fetchAllData = useCallback(async () => {
        if (!session?.user) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        const { user } = session;

        // Fetch all stars that are approved OR belong to the current user
        const { data, error } = await supabase
            .from('stars')
            .select(`*, users!user_id(username)`)
            .or(`status.eq.approved,user_id.eq.${user.id}`);

        if (error) {
            console.error("Error fetching stars:", error);
            setLoading(false);
            return;
        }

        const finalStars = data || [];
        
        // Check if the user has a recent post among the fetched stars
        const userPosts = finalStars.filter(star => star.user_id === user.id);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const hasRecentPost = userPosts.some(post => new Date(post.created_at) > twentyFourHoursAgo);
        
        setStars(finalStars);
        setHasPostedToday(hasRecentPost);
        setLoading(false);

    }, [session]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    if (loading) {
        return <div className="min-vh-100 bg-dark text-white d-flex justify-content-center align-items-center">Loading your universe...</div>;
    }

    return (
        <>
            {hasPostedToday ? (
                // We no longer pass newStarId to simplify the logic
                <NightSkyCanvas stars={stars} onStarClick={handleStarClick} /> // 3. Pass the click handler
            ) : (
                // We pass the fetchAllData function as the callback
                <PostCreationOverlay user={session.user} onPostSuccess={fetchAllData} />
            )}
            <StarPlayerModal 
                star={selectedStar} 
                show={isModalOpen} 
                onHide={() => setIsModalOpen(false)} 
            />
        </>
    );
}