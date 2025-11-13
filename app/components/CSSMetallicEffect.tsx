"use client";

import { useState, useEffect } from 'react';

const CSSMetallicEffect = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black relative overflow-hidden">
      {isLoaded ? (
        <div className="relative">
          {/* Metallic circle with CSS animations */}
          <div className="relative w-64 h-64 rounded-full overflow-hidden">
            {/* Base metallic background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600 rounded-full"></div>
            
            {/* Animated metallic shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse"
                 style={{
                   background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                   animation: 'shimmer 2s ease-in-out infinite'
                 }}></div>
            
            {/* Liquid metallic waves */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20 rounded-full animate-pulse"
                   style={{
                     animation: 'liquidFlow 3s ease-in-out infinite'
                   }}></div>
              <div className="absolute inset-0 bg-gradient-to-l from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-full animate-pulse"
                   style={{
                     animation: 'liquidFlow 3s ease-in-out infinite reverse'
                   }}></div>
            </div>
            
            {/* Reflective highlights */}
            <div className="absolute top-8 left-8 w-16 h-16 bg-white/40 rounded-full blur-sm animate-ping"
                 style={{ animationDuration: '2s' }}></div>
            <div className="absolute bottom-12 right-12 w-12 h-12 bg-white/30 rounded-full blur-sm animate-ping"
                 style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
          </div>
          
          {/* Floating metallic particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full animate-bounce"
                style={{
                  left: `${20 + i * 10}%`,
                  top: `${25 + (i % 3) * 25}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s'
                }}
              ></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-lg animate-pulse">
          Loading metallic effect...
        </div>
      )}
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(45deg); }
          50% { transform: translateX(100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        
        @keyframes liquidFlow {
          0% { transform: translateX(-50%) scale(1); opacity: 0.3; }
          50% { transform: translateX(0%) scale(1.1); opacity: 0.6; }
          100% { transform: translateX(50%) scale(1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default CSSMetallicEffect;
