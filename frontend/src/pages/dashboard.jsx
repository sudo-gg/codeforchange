import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

// Star component for animated background
const Star = ({ x, y, size, opacity, animationDelay }) => (
  <div
    style={{
      position: 'fixed',
      left: `${x}vw`,
      top: `${y}vh`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: 'white',
      borderRadius: '50%',
      opacity: opacity,
      animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
      animationDelay: `${animationDelay}s`,
      zIndex: 1,
      pointerEvents: 'none'
    }}
  />
);

// Shooting star component
const ShootingStar = ({ delay }) => (
  <div
    style={{
      position: 'fixed',
      left: '100vw',
      top: `${Math.random() * 100}vh`,
      width: '4px',
      height: '4px',
      backgroundColor: 'white',
      borderRadius: '50%',
      opacity: 0.7,
      animation: `shootingStar 3s linear infinite`,
      animationDelay: `${delay}s`,
      zIndex: 1,
      pointerEvents: 'none'
    }}
  >
    <div 
      style={{
        position: 'absolute',
        width: '80px',
        height: '2px',
        background: 'linear-gradient(to right, white, transparent)',
        transform: 'translateY(-1px)',
      }}
    />
  </div>
);

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stars, setStars] = useState([]);
  const [backgroundStars, setBackgroundStars] = useState([]);
  const [error, setError] = useState(null);
  const [user_id, setUser_id] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [playingAudio, setPlayingAudio] = useState(null);

  const audioRef = useRef(null);

  // Generate background stars
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          animationDelay: Math.random() * 3,
        });
      }
      setBackgroundStars(newStars);
    };
    generateStars();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error(error)
        return
      }
      setUser_id(user?.id);
      
      //setUser_id('demo-user-123');
    }
    getUser()
  }, [])

  useEffect(() => {
    if (user_id !== null) {
      // Simulate fetching user data
      const fetchUserData = async () => {
        const { data, error } = await supabase
                    .from('users')
                    .select('username, karma_score')
                    .eq('id', user_id);
    
                if (error) {
                    setError(error.message);
                    console.error('Error fetching user data:', error);
                } else {
                    setUser(data);
                    // user contains username and karma_score
                }
        // Demo data
        //setUser([{ username: 'StarGazer', karma_score: 1250 }]);
      };

      // Simulate fetching stars data with proper timestamptz format
      const fetchStars = async () => {
        // Demo data with timestamptz format like your database
        // const demoStars = [
        //   {
        //     created_at: '2024-12-15 14:30:05.861472+00',
        //     karma: 10,
        //     audio_url: 'demo-audio-1.mp3'
        //   },
        //   {
        //     created_at: '2024-12-10 09:15:22.543210+00',
        //     karma: 15,
        //     audio_url: 'demo-audio-2.mp3'
        //   },
        //   {
        //     created_at: '2024-12-05 16:45:18.123456+00',
        //     karma: 8,
        //     audio_url: 'demo-audio-3.mp3'
        //   }
        // ];
        // setStars(demoStars);
        
        const { data, error } = await supabase
          .from('stars')
          .select('created_at, karma, audio_url')
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
    }
  }, [user_id]);

  // Get calendar data
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const hasAudio = stars.some(star => {
        // Handle timestamptz format from PostgreSQL
        const starDate = new Date(star.created_at);
        return starDate.toDateString() === currentDate.toDateString();
      });
      
      days.push({
        day,
        date: currentDate,
        hasAudio,
        audioData: hasAudio ? stars.find(star => 
          new Date(star.created_at).toDateString() === currentDate.toDateString()
        ) : null
      });
    }
    
    // Add empty cells to complete the grid (42 cells total for 6 weeks)
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push(null);
    }
    
    return days;
  };

  const handleDateClick = (dayData) => {
    // THIS IS WHAT I WANT TO DO BUT IT JUST RESETS THE AUDIO
    //audioRef.current.src = dayData.audioData.audio_url;
    setSelectedDate(dayData.date);
    
    if (dayData && dayData.hasAudio) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play();
          setPlayingAudio(dayData.audioData);
        } else {
          audioRef.current.pause();
          setPlayingAudio(null);
        }
      }
    if (audioRef.current) {
        audioRef.current.onended = () => {
          setPlayingAudio(null);
        };
      }
  }};

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };
  const deleteAudio = async (audioUrl) => {
    const filePath = audioUrl.replace(
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/audio-notes/`,
  ''
);

const { error: deleteError } = await supabase
  .storage
  .from('audio-notes')
  .remove([filePath]);

if (deleteError) {
  console.error("Error deleting audio file:", deleteError);
} else {
  const { error } = await supabase
  .from('stars')
  .delete()
  .eq('id', starId) // for safety
  .eq('user_id', user_id);

if (error) {
  console.error("Error deleting star:", error);
  }
  }
  console.log("Audio file deleted successfully allegedly");
};
  const days = getDaysInMonth(currentMonth);
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
    <style>{`
    @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');

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

.galaxy-bg {
    background: radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0f0f23 100%);
    min-height: 100vh;
    position: relative;
    overflow: hidden;
}

.nebula-1 {
    position: absolute;
    top: 10%;
    left: 10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(40px);
}

.nebula-2 {
    position: absolute;
    bottom: 20%;
    right: 15%;
    width: 250px;
    height: 250px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(35px);
}

.glass-morphism {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.125);
}

.calendar-day {
    aspect-ratio: 1;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    background: rgba(255, 255, 255, 0.02);
    min-height: 60px;
    width: 100%;
}

.calendar-day:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
}

.has-audio {
    background: rgba(59, 130, 246, 0.3) !important;
    border-color: rgba(59, 130, 246, 0.6) !important;
    animation: pulse 2s ease-in-out infinite;
}

.has-audio::after {
    content: '🎵';
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 12px;
}

.playing-audio {
    background: rgba(34, 197, 94, 0.4) !important;
    border-color: rgba(34, 197, 94, 0.7) !important;
}

.text-glow {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.btn-galaxy {
    background: linear-gradient(45deg, rgba(59, 130, 246, 0.8), rgba(99, 102, 241, 0.8));
    border: 1px solid rgba(59, 130, 246, 0.5);
    color: white;
    transition: all 0.3s ease;
}

.btn-galaxy:hover {
    background: linear-gradient(45deg, rgba(59, 130, 246, 1), rgba(99, 102, 241, 1));
    border-color: rgba(59, 130, 246, 0.8);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}` }

    </style>
      <div className="galaxy-bg">
        {/* Animated star field */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'none' }}>
          {backgroundStars.map((star) => (
            <Star key={star.id} {...star} />
          ))}
        </div>
        
        {/* Shooting stars */}
        <ShootingStar delay={10} />
        <ShootingStar delay={40} />
        <ShootingStar delay={16} />
        
        {/* Nebula effects */}
        <div className="nebula-1"></div>
        <div className="nebula-2"></div>
        
        <div className="container-fluid py-4 position-relative" style={{ zIndex: 10 }}>
          {/* Dashboard Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="glass-morphism rounded-3 p-4">
                <h1 className="display-4 text-white text-glow mb-0">Dashboard</h1>
                {error && (
                  <div className="alert alert-danger mt-3" role="alert">
                    Error: {error}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="row">
            {/* User Info Section */}
            <div className="col-lg-4 mb-4">
              <div className="glass-morphism rounded-3 p-4 h-100">
                <div className="text-center mb-4">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(45deg, #3b82f6, #6366f1)',
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
                    }}
                  >
                    <i className="fas fa-user text-white fs-2"></i>
                  </div>
                  <h2 className="text-white mb-2">
                    Welcome, {user ? user[0].username : '...'}
                  </h2>
                  <p className="text-light mb-0">
                    <span className="badge bg-primary fs-6">
                      ⭐ Karma: {user ? user[0].karma_score : '...'}
                    </span>
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-light small mb-0">
                    Total Voice Notes: {stars.length}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Calendar Section */}
            <div className="col-lg-8">
              <div className="glass-morphism rounded-3 p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="text-white mb-0">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Your Audio Journey
                  </h2>
                  <div className="d-flex align-items-center gap-2">
                    <button 
                      className="btn btn-outline-light btn-sm"
                      onClick={() => navigateMonth(-1)}
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <h4 className="text-white mb-0 mx-3">
                      {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h4>
                    <button 
                      className="btn btn-outline-light btn-sm"
                      onClick={() => navigateMonth(1)}
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
                
                {/* Calendar */}
                <div className="calendar-container">
                  {/* Day headers */}
                  <div className="row g-1 mb-2">
                    {dayNames.map(dayName => (
                      <div key={dayName} className="col">
                        <div className="text-center text-light small fw-bold py-2">
                          {dayName}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid - 6 rows for full month display */}
                  {[0, 1, 2, 3, 4, 5].map(weekIndex => (
                    <div key={weekIndex} className="row g-1 mb-1">
                      {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
                        const dayData = days[weekIndex * 7 + dayIndex];
                        return (
                          <div key={dayIndex} className="col" style={{ maxWidth: '14.28%', flex: '0 0 14.28%' }}>
                            <div 
                              className={`calendar-day d-flex align-items-center justify-content-center text-white rounded ${
                                dayData?.hasAudio ? 'has-audio' : ''
                              } ${
                                playingAudio && dayData?.audioData === playingAudio ? 'playing-audio' : ''
                              } ${
                                !dayData ? 'invisible' : ''
                              }`}
                              style={{ minHeight: '60px', cursor: dayData?.hasAudio ? 'pointer' : 'default' }}
                              onClick={() => handleDateClick(dayData)}
                            >
                              {dayData?.day}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="mt-4 pt-3 border-top border-secondary">
                  <div className="row text-center">
                    <div className="col-md-4">
                      <div className="d-flex align-items-center justify-content-center text-light small">
                        <div 
                          className="rounded me-2"
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            background: 'rgba(59, 130, 246, 0.3)',
                            border: '1px solid rgba(59, 130, 246, 0.6)'
                          }}
                        ></div>
                        Has Voice Note
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex align-items-center justify-content-center text-light small">
                        <div 
                          className="rounded me-2"
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            background: 'rgba(34, 197, 94, 0.4)',
                            border: '1px solid rgba(34, 197, 94, 0.7)'
                          }}
                        ></div>
                        Currently Playing
                      </div>
                    </div>
                    <div className="col-md-4">
                      <p className="text-light small mb-0">
                        Click on highlighted dates to play
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Audio Player Section */}
          {selectedDate && (
            <div className="row mt-4">
              <div className="col-12">
                <div className="glass-morphism rounded-3 p-4">
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <h5 className="text-white mb-1">
                        <i className="fas fa-play-circle me-2"></i>
                        Voice Note from {selectedDate.toLocaleDateString()}
                      </h5>
                      <p className="text-light small mb-0">
                        {playingAudio ? 'Now playing...' : 'Click to play your memory'}
                      </p>
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-galaxy btn-sm"
                        onClick={() => {
                          if (audioRef.current) {
                            if (audioRef.current.paused) {
                              audioRef.current.play();
                            } else {
                              audioRef.current.pause();
                            }
                          }
                        }}
                      >
                        <i className="fas fa-play me-1"></i>
                        Play
                      </button>
                      <button className="btn btn-outline-light btn-sm">
                        <i className="fas fa-download"></i>
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => deleteAudio(selectedAudio)}>
                        <i className="fas fa-trash">
                          Delete voice note
                        </i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <audio ref={audioRef} controls style={{ display: 'none' }} />
        </div>
      </div>
    </>
  );
}