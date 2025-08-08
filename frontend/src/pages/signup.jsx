import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
// import Link from 'next/link'
// import { useRouter } from 'next/router'
import { Link, useNavigate } from "react-router-dom";

const Star = ({ x, y, size, opacity, animationDelay }) => (
  <div
    className="absolute rounded-full bg-white animate-pulse"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      opacity: opacity,
      animationDelay: `${animationDelay}s`,
      animationDuration: `${2 + Math.random() * 3}s`,
    }}
  />
);

// Shooting star component
const ShootingStar = ({ delay }) => (
  <div
    className="absolute w-1 h-1 bg-white rounded-full opacity-70"
    style={{
      left: '100%',
      top: `${Math.random() * 50}%`,
      animation: `shootingStar 3s linear infinite`,
      animationDelay: `${delay}s`,
    }}
  >
    <div className="absolute w-20 h-0.5 bg-gradient-to-r from-white to-transparent -translate-y-0.5" />
  </div>
);


export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setusername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [stars, setStars] = useState([]);

  // Generate stars on component mount
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 150; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          animationDelay: Math.random() * 3,
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    } 
      setMessage("Check your email for the confirmation link!");
    const userId = data?.user?.id;
    if (userId) {
      const {error: userError } = await supabase
        .from("users")
        .insert(
          [
            {
                id: userId,
                username: username,
                karma_score: 0
              }
          ]);
    if (userError) {
      console.error("Error creating user:", userError);
    }
    }


    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setMessage('Account created successfully! Welcome to your wellness journey.');
      navigate("/login");
    }, 2000);
  };

  return (
    <>
      <style jsx>{`
        @keyframes shootingStar {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateX(-200vw) translateY(100px);
            opacity: 0;
          }
        }
        

        
        .glass-morphism {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.125);
        }
        
        .glow {
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
        }
        
        .input-glow:focus {
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
        }
        
        .text-glow {
          text-shadow: 0 0 4px rgba(255, 255, 255, 0.3);
        }
      `}</style>
      
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
           style={{
             background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 35%, #0f0f23 100%)'
           }}>
        
        {/* Animated star field */}
        <div className="absolute inset-0">
          {stars.map((star) => (
            <Star key={star.id} {...star} />
          ))}
        </div>
        
        {/* Shooting stars */}
        <ShootingStar delay={0} />
        <ShootingStar delay={2} />
        <ShootingStar delay={4} />
        
        {/* Nebula effects */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-10" />
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-slate-500 rounded-full mix-blend-screen filter blur-3xl opacity-8" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-6" />
        
        <div className="max-w-md w-full space-y-8 z-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-slate-600 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-2 text-glow">
              Begin Your Journey
            </h2>
            <p className="text-slate-300 text-lg">
              Create your account for wellness among the stars
            </p>
          </div>

          <div className="glass-morphism bg-white bg-opacity-5 backdrop-blur-md rounded-2xl p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-slate-300 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-slate-400 border-opacity-30 placeholder-slate-400 text-white bg-white bg-opacity-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-opacity-15 sm:text-sm input-glow transition-all duration-300"
                  placeholder="Choose your stellar identity"
                  value={username}
                  onChange={(e) => setusername(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email-address" className="block text-slate-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-slate-400 border-opacity-30 placeholder-slate-400 text-white bg-white bg-opacity-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-opacity-15 sm:text-sm input-glow transition-all duration-300"
                  placeholder="your.cosmic@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-slate-300 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-slate-400 border-opacity-30 placeholder-slate-400 text-white bg-white bg-opacity-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-opacity-15 sm:text-sm input-glow transition-all duration-300"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-slate-300 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-slate-400 border-opacity-30 placeholder-slate-400 text-white bg-white bg-opacity-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-opacity-15 sm:text-sm input-glow transition-all duration-300"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 text-red-300 px-4 py-3 rounded-lg text-sm text-center backdrop-blur-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-500 bg-opacity-20 border border-green-400 border-opacity-30 text-green-300 px-4 py-3 rounded-lg text-sm text-center backdrop-blur-sm">
                {message}
              </div>
            )}

            <div>
              <button
                onClick={handleSignup}
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300 disabled:hover:scale-100"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <svg className="h-5 w-5 text-slate-300 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                {loading ? "Launching into space..." : "Start Your Cosmic Journey"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-slate-300 text-sm">
                Already exploring the cosmos?{" "}
                <a
                  href="/login"
                  className="font-medium text-slate-200 hover:text-white transition-colors duration-300"
                >
                  Return to your stellar sanctuary
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

  
  
  
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [userName, setUserName] = useState("");
//   const [message, setMessage] = useState("");
//   // const router = useRouter()
//   const navigate = useNavigate();

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setMessage("");

//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       setLoading(false);
//       return;
//     }

//     if (password.length < 6) {
//       setError("Password must be at least 6 characters long");
//       setLoading(false);
//       return;
//     }

//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//     });

//     if (error) {
//       setError(error.message);
//     } else {
//       setMessage("Check your email for the confirmation link!");
//       const userId = data?.user?.id;
//       if (userId) {
//         const {error: userError } = await supabase
//           .from("users")
//           .insert(
//             [
//               {
//                  id: userId,
//                  username: userName,
//                  karma_score: 0
//                 }
//               ]);
//         if (userError) {
//           console.error("Error creating user:", userError);
//         }
//       }
//       // Optionally redirect to login page after a delay
//       setTimeout(() => {
//         navigate("/login");
//       }, 3000);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Create your account
//           </h2>
//         </div>
//         <form className="mt-8 space-y-6" onSubmit={handleSignup}>
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div>
//               <label htmlFor="email-address" className="sr-only">
//                 Email address
//               </label>
//               <input
//                 id="email-address"
//                 name="email"
//                 type="email"
//                 autoComplete="email"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Email address"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>
//             <div>
//               <label htmlFor="password" className="sr-only">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 autoComplete="new-password"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>
//             <div>
//               <label htmlFor="confirm-password" className="sr-only">
//                 Confirm Password
//               </label>
//               <input
//                 id="confirm-password"
//                 name="confirm-password"
//                 type="password"
//                 autoComplete="new-password"
//                 required
//                 className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                 placeholder="Confirm password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />
//             </div>
//           </div>

//           {error && (
//             <div className="text-red-600 text-sm text-center">{error}</div>
//           )}

//           {message && (
//             <div className="text-green-600 text-sm text-center">{message}</div>
//           )}

//           <div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//             >
//               {loading ? "Creating account..." : "Sign up"}
//             </button>
//           </div>

//           <div className="text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{" "}
//               <Link
//                 to="/login"
//                 className="font-medium text-indigo-600 hover:text-indigo-500"
//               >
//                 Sign in here!
//               </Link>
//             </p>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
