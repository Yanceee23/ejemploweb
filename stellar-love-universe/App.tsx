
import React, { useState, useEffect, useCallback } from 'react';
import Universe from './components/Universe';
import HandTracker from './components/HandTracker';
import { GestureState } from './types';
import { generateRomanticMessage } from './services/geminiService';

const App: React.FC = () => {
  const [gesture, setGesture] = useState<GestureState>(GestureState.OPEN);
  const [message, setMessage] = useState<string>("");
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const handleGestureChange = useCallback((newGesture: GestureState) => {
    setGesture(newGesture);
  }, []);

  useEffect(() => {
    if (gesture === GestureState.CLOSED) {
      // Trigger romantic message when hand closes
      const fetchMessage = async () => {
        const msg = await generateRomanticMessage();
        setMessage(msg);
        setIsMessageVisible(true);
      };
      fetchMessage();
    } else {
      setIsMessageVisible(false);
    }
  }, [gesture]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans">
      {/* Dynamic Universe Background */}
      <Universe gesture={gesture} />

      {/* Main Overlay UI */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pointer-events-none">
        
        {/* Instructions */}
        <div className={`transition-all duration-1000 transform ${gesture === GestureState.CLOSED ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center space-y-4 max-w-md mx-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-widest text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              ESTELAR
            </h1>
            <p className="text-pink-200/70 text-sm md:text-base leading-relaxed">
              El universo guarda un secreto para ti.<br/>
              Muestra tu mano y <span className="text-pink-400 font-bold">ciérrala</span> para revelarlo.
            </p>
            <div className="flex justify-center gap-4 pt-2">
               <div className="w-10 h-10 rounded-full border border-pink-500/50 flex items-center justify-center animate-pulse">
                  <span className="text-xl">✨</span>
               </div>
            </div>
          </div>
        </div>

        {/* Gemini Generated Romantic Message */}
        <div className={`absolute bottom-32 md:bottom-24 px-8 py-4 transition-all duration-700 transform ${isMessageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <p className="text-xl md:text-3xl font-serif italic text-white text-center drop-shadow-lg max-w-2xl bg-gradient-to-r from-transparent via-black/40 to-transparent p-4">
            {message}
          </p>
        </div>

        {/* Floating Hearts/Particles on Gesture */}
        {gesture === GestureState.CLOSED && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
             {[...Array(15)].map((_, i) => (
               <div 
                 key={i}
                 className="absolute text-pink-500/30 animate-float-heart text-2xl"
                 style={{
                   left: `${Math.random() * 100}%`,
                   top: `${Math.random() * 100}%`,
                   animationDelay: `${Math.random() * 5}s`,
                   animationDuration: `${3 + Math.random() * 5}s`
                 }}
               >
                 ❤️
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Camera Tracker Component */}
      <HandTracker onGestureChange={handleGestureChange} />

      {/* Ambient Sound Icon (Mock) */}
      <div className="fixed top-6 right-6 z-20 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
      </div>

      <style>{`
        @keyframes float-heart {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
        }
        .animate-float-heart {
          animation: float-heart linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
