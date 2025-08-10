import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

const BlogPost = ({ title, excerpt, author, date, readTime, onClick }) => (
  <div className="card bg-dark border-secondary mb-4 h-100">
    <div className="card-body d-flex flex-column">
      <h5 className="card-title text-light mb-3">{title}</h5>
      <p className="card-text text-secondary flex-grow-1">{excerpt}</p>
      <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
        <span>By {author}</span>
        <span>{date} • {readTime} min read</span>
      </div>
      <button onClick={onClick} className="btn btn-outline-primary btn-sm">
        Read More →
      </button>
    </div>
  </div>
);

export default function BlogPage() {
  const [stars, setStars] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [opacity, setOpacity] = useState(0);
  const clickedpfp = '../../images.jpeg';
  const soundSrc = '../../vine-boom.mp3';
  
  const handlepfpClick = () => {
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

    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: var(--opacity); }
        50% { opacity: calc(var(--opacity) * 0.3); }
      }
    `;
    document.head.appendChild(style);
    
    return () => document.head.removeChild(style);
  }, []);

  const blogPosts = [
    {
      title: "Finding Your Voice in the Digital Universe",
      excerpt: "Discover how to share your authentic thoughts and connect with others in meaningful ways across the vast digital landscape.",
      author: "Sofa King Fast",
      date: "Aug 8, 2025",
      readTime: 5,
      content: `In the vast expanse of the digital universe, finding your authentic voice can feel as challenging as navigating uncharted galaxies. Yet, just as stars shine brightest in the darkest spaces, your unique perspective has the power to illuminate and inspire others.

The key to authentic digital communication lies not in crafting the perfect message, but in embracing vulnerability and genuine connection. When we share our real experiences—both triumphs and struggles—we create constellations of understanding that guide others through their own journeys.

Research shows that authentic self-expression online leads to stronger relationships and better mental health outcomes. By being true to ourselves in digital spaces, we not only find our own path but light the way for others seeking similar connections.

Remember: your voice matters. In a universe of infinite possibilities, your perspective is uniquely yours to share.`
    },
    {
      title: "The Power of Community Wisdom",
      excerpt: "Learn how collective knowledge and shared experiences can illuminate paths forward when you're facing life's biggest challenges.",
      author: "Ben Dover",
      date: "Aug 5, 2025",
      readTime: 7,
      content: `Throughout history, humanity's greatest achievements have come not from isolated brilliance, but from the collective wisdom of communities working together. In our digital age, this principle remains more relevant than ever.

Community wisdom operates like a constellation—individual points of light that, when connected, reveal patterns and guidance invisible to any single perspective. When facing life's challenges, tapping into this collective knowledge can provide insights that no individual could reach alone.

Studies demonstrate that people who actively engage with supportive communities show improved problem-solving abilities, reduced stress levels, and greater resilience in facing adversity. The diversity of experiences within a community creates a rich tapestry of potential solutions and perspectives.

The magic happens when we both give and receive—sharing our own experiences while remaining open to learning from others. This reciprocal exchange creates a dynamic ecosystem of support and growth.`
    },
    {
      title: "Building Resilience Through Shared Stories",
      excerpt: "Explore how reading about others' journeys and sharing your own can create strength and hope during difficult times.",
      author: "Anita Bath",
      date: "Jul 30, 2025",
      readTime: 4,
      content: `Stories have always been humanity's way of making sense of the world and building resilience in the face of adversity. In our connected age, the power of shared narratives has only grown stronger.

When we read about others' journeys through hardship and triumph, we gain more than information—we gain perspective, hope, and practical strategies for our own challenges. These stories serve as proof that obstacles can be overcome and that we're not alone in our struggles.

Equally important is the act of sharing our own stories. Research shows that people who write about their experiences show improved emotional processing and increased resilience over time. By articulating our journeys, we not only help ourselves heal but contribute to the collective wisdom that supports others.

The beauty of digital storytelling is its accessibility. Every person has experiences that could help someone else, and platforms that facilitate this sharing create ripple effects of positive impact throughout communities.`
    }
  ];

  if (selectedPost) {
    return (
      <>
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ pointerEvents: 'none' }}>
          {stars.map((star) => (
            <Star key={star.id} {...star} />
          ))}
        </div>

        <div className="bg-dark min-vh-100 d-flex flex-column">
          {/* Navbar */}
          <nav className="navbar navbar-expand-md navbar-dark bg-dark border-bottom border-secondary px-4">
            <div className="container-fluid">
              <span className="navbar-brand fw-bold fs-4">Elevate Blog</span>
            </div>
          </nav>

          {/* Article Content */}
          <main className="flex-grow-1 container-fluid px-4 py-5">
            <div className="row justify-content-center">
              <div className="col-12 col-lg-8">
                <article>
                  <div className="text-center mb-5">
                    <h1 className="display-5 fw-bold text-light mb-3" style={{ textShadow: '0 2px 16px #0008' }}>
                      {selectedPost.title}
                    </h1>
                    <div className="d-flex justify-content-center align-items-center gap-3 mb-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      <span>By {selectedPost.author}</span>
                      <span>•</span>
                      <span>{selectedPost.date}</span>
                      <span>•</span>
                      <span>{selectedPost.readTime} min read</span>
                    </div>
                  </div>
                  
                  <div className="card bg-dark border-secondary">
                    <div className="card-body p-4">
                      <div className="text-light" style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
                        {selectedPost.content.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-4">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-5">
                    <button onClick={() => setSelectedPost(null)} className="btn btn-primary btn-lg">
                      ← Back to All Posts
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ pointerEvents: 'none' }}>
        {stars.map((star) => (
          <Star key={star.id} {...star} />
        ))}
      </div>

      <div className="bg-dark min-vh-100 d-flex flex-column">
        {/* Navbar */}
        <nav className="navbar navbar-expand-md navbar-dark bg-dark border-bottom border-secondary px-4">
          <div className="container-fluid">
            <div className="navbar-brand d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
              <div style={{
                width: 32, height: 32,
                background: 'linear-gradient(90deg, #a78bfa, #2563eb)',
                cursor: "pointer",
                borderRadius: 8
              }} 
              onClick={() => {
                handlepfpClick();
              }}
              onMouseEnter={() => setOpacity(1)}
              onMouseLeave={() => setOpacity(0)}>
                <img
                  src={clickedpfp}
                  alt="Profile"
                  className="w-100 h-100 border border-4 border-white"
                  style={{
                    objectFit: "cover",
                    opacity: opacity,
                    transition: "opacity 0.3s ease",
                    borderRadius: 8,
                    position: "relative",
                    top: "-2px"
                  }}
                />
              </div>
              <Link className="navbar-brand d-flex align-items-center gap-2" to="/"><span className="fw-bold fs-4">Elevate</span></Link>
            </div>
            
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="mainNav">
              <ul className="navbar-nav ms-auto mb-2 mb-md-0">
                {/* <li className="nav-item">
                  <a className="nav-link" href="/how-it-works">How It Works</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/features">Features</a>
                </li> */}
                <li className="nav-item">
                  <a className="nav-link active" href="/blog">Blog</a>
                </li>
              </ul>
              <div className="d-flex ms-md-3 gap-2">
                <a href="/login" className="btn btn-outline-light btn-sm">Login</a>
                <a href="/register" className="btn btn-primary btn-sm">Sign Up</a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow-1 container-fluid px-4 py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10 col-xl-8">
              {/* Header */}
              <div className="text-center mb-5">
                <h1 className="display-4 fw-bold text-light mb-3" style={{ textShadow: '0 2px 16px #0008' }}>
                  <span style={{
                    background: 'linear-gradient(90deg, #a78bfa, #2563eb)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Galaxy
                  </span> Blog
                </h1>
                <p className="lead text-secondary">
                  Stories, insights, and wisdom from our community of explorers
                </p>
              </div>

              {/* Featured Post */}
              <div className="card bg-dark border-secondary mb-5">
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <span className="badge bg-primary mb-2">Featured</span>
                      <h3 className="card-title text-light mb-3">Introducing.... Elevate!</h3>
                      <p className="card-text text-secondary mb-3">
                        Welcome to Elevate! 
                        here are some notes to help you understand our mission.
                      </p>
                      <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                        <span>By The Elevate Developer team</span>
                        <span>Aug 10, 2025 • 2 min read</span>
                      </div>
                      <button className="btn btn-primary" onClick={() => setSelectedPost({
                        title: "Elevate Developer Notes",
                        author: "The Elevate Developer team",
                        date: "Aug 10, 2025",
                        readTime: 2,
                        content: `We’re thrilled to share the launch of Elevate—a community-driven space for encouragement and hope.

We all have days that feel heavy. Some are so tough it’s hard to even get out of bed. In our hyper-connected world, it’s surprising how lonely we can still feel.

Elevate was created to change that. Our platform lets you send and receive uplifting audio messages—small bursts of positivity that can help someone keep going. You can also revisit your own messages anytime, a reminder of the hope you’ve shared and received.

Our mission is simple: to show that no one is alone in their journey. Wherever you are, someone is rooting for you.

It gets better—and we’re so glad you’re here.`
                      })}>
                        Read Featured Article →
                      </button>
                    </div>
                    <div className="col-md-4 text-center">
                      <div 
                        className="mx-auto mb-3"
                        style={{
                          width: 120,
                          height: 120,
                          background: 'linear-gradient(135deg, #a78bfa, #2563eb)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span className="text-white fw-bold fs-1">★</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Post */}
              <div className="card bg-dark border-secondary mb-5">
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <span className="badge bg-primary mb-2">Featured</span>
                      <h3 className="card-title text-light mb-3">Elevate Developer Notes</h3>
                      <p className="card-text text-secondary mb-3">
                        Here are the developer notes, tools Elevate uses.
                      </p>
                      <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                        <span>By The Elevate Developer team</span>
                        <span>Aug 10, 2025 • 2 min read</span>
                      </div>
                      <button className="btn btn-primary" onClick={() => setSelectedPost({
                        title: "Elevate Developer Notes",
                        author: "The Elevate Developer team",
                        date: "Aug 10, 2025",
                        readTime: 2,
                        content: `Welcome to Elevate Developer Notes

For our first issue, we will be discussing how Elevate was created and some of the issues we faced along the way.

Elevate is a community-driven platform first and foremost, so all user entries have to be stored in a database. For our purposes, we made use of Supabase. Supabase has been great to work with, as it helped us store user info/data and also manage our authentication and signup processes.

Our web app is inspired by community, and what better way to represent their contributions than stars? Upon entering our app, you’re welcomed by multiple galaxies, each representing a certain problem people are facing. In each galaxy, there are stars representing voice notes from members of our community. At the top of the landing page, there’s a dashboard that compiles your audio recordings and gives you a quick profile overview. The explore button takes you back to the galaxies.

Elevate’s simplicity makes it easy to use and understand. We want people to listen to the messages here and use them to find the energy to do other things. The Elevate app has more features in the making, and we hope to bring these to our community soon.

Till then, stay bright.`
                      })}>
                        Read Featured Article →
                      </button>
                    </div>
                    <div className="col-md-4 text-center">
                      <div 
                        className="mx-auto mb-3"
                        style={{
                          width: 120,
                          height: 120,
                          background: 'linear-gradient(135deg, #a78bfa, #2563eb)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span className="text-white fw-bold fs-1">★</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blog Posts Grid */}
              <div className="row g-4 mb-5">
                {blogPosts.map((post, index) => (
                  <div key={index} className="col-md-6">
                    <BlogPost {...post} onClick={() => setSelectedPost(post)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-top border-secondary py-4">
          <div className="container-fluid px-4">
            <div className="row align-items-center">
              <div className="col-md-6">
                <p className="mb-0" style={{ color: 'white' }}>&copy; 2025 Elevate. Built under extreme caffeine influence.</p>
              </div>
              <div className="col-md-6 text-md-end">
                <div className="d-flex justify-content-md-end gap-3">
                  <a href="/blog/privacy" className="text-decoration-none" style={{ color: 'white' }}>Privacy</a>
                  <a href="/blog/terms" className="text-decoration-none" style={{ color: 'white' }}>Terms</a>
                  <a href="/blog/contact" className="text-decoration-none" style={{ color: 'white' }}>Contact</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}