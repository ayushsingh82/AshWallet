"use client";

import { useState, useEffect } from 'react';

const SimpleMetallicEffect = () => {
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
          {/* Main metallic circle */}
          <div className="relative w-80 h-80 rounded-full overflow-hidden">
            {/* Base metallic gradient */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 25%, #f0f0f0 50%, #e8e8e8 75%, #c0c0c0 100%)'
              }}
            ></div>
            
            {/* Animated metallic shine */}
            <div 
              className="absolute inset-0 rounded-full opacity-60"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)',
                animation: 'metallicShine 2s ease-in-out infinite'
              }}
            ></div>
            
            {/* Liquid metallic waves */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div 
                className="absolute inset-0 rounded-full opacity-40"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)',
                  animation: 'liquidFlow 3s ease-in-out infinite'
                }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full opacity-30"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)',
                  animation: 'liquidFlow 3s ease-in-out infinite reverse'
                }}
              ></div>
            </div>
            
            {/* Reflective highlights */}
            <div 
              className="absolute top-12 left-12 w-16 h-16 bg-white/50 rounded-full blur-sm"
              style={{ animation: 'highlightPulse 2s ease-in-out infinite' }}
            ></div>
            <div 
              className="absolute bottom-16 right-16 w-12 h-12 bg-white/40 rounded-full blur-sm"
              style={{ animation: 'highlightPulse 2.5s ease-in-out infinite 0.5s' }}
            ></div>
            
            {/* Metallic particles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white/60 rounded-full"
                  style={{
                    left: `${20 + i * 12}%`,
                    top: `${30 + (i % 2) * 40}%`,
                    animation: `particleFloat ${2 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-white text-lg animate-pulse">
          Loading metallic effect...
        </div>
      )}
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes metallicShine {
          0% { transform: translateX(-100%) rotate(45deg); }
          50% { transform: translateX(100%) rotate(45deg); }
          100% { transform: translateX(100%) rotate(45deg); }
        }
        
        @keyframes liquidFlow {
          0% { transform: translateX(-50%) scale(1); opacity: 0.2; }
          50% { transform: translateX(0%) scale(1.1); opacity: 0.6; }
          100% { transform: translateX(50%) scale(1); opacity: 0.2; }
        }
        
        @keyframes highlightPulse {
          0% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
          100% { opacity: 0.3; transform: scale(0.8); }
        }
        
        @keyframes particleFloat {
          0% { transform: translateY(0px) scale(1); opacity: 0.4; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(0px) scale(1); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default SimpleMetallicEffect;

