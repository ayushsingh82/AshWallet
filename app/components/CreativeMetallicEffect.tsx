"use client";

import { useState, useEffect } from 'react';

const CreativeMetallicEffect = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black relative overflow-hidden">
      {isLoaded ? (
        <div className="relative">
          {/* Main metallic orb */}
          <div className="relative w-96 h-96 rounded-full overflow-hidden">
            {/* Base metallic gradient with depth */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `
                  radial-gradient(circle at 30% 30%, #ffffff 0%, #e8e8e8 15%, #c0c0c0 30%, #a8a8a8 50%, #909090 70%, #787878 85%, #606060 100%)
                `
              }}
            ></div>
            
            {/* Animated metallic shine - multiple layers */}
            <div 
              className="absolute inset-0 rounded-full opacity-70"
              style={{
                background: 'linear-gradient(45deg, transparent 20%, rgba(255,255,255,0.9) 40%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.9) 60%, transparent 80%)',
                animation: 'metallicShine 2.5s ease-in-out infinite'
              }}
            ></div>
            
            <div 
              className="absolute inset-0 rounded-full opacity-50"
              style={{
                background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%)',
                animation: 'metallicShine 2.5s ease-in-out infinite reverse'
              }}
            ></div>
            
            {/* Liquid metallic waves - multiple directions */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div 
                className="absolute inset-0 rounded-full opacity-60"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.2) 60%, rgba(255,255,255,0.4) 100%)',
                  animation: 'liquidFlow 4s ease-in-out infinite'
                }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full opacity-40"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.1) 80%)',
                  animation: 'liquidFlow 4s ease-in-out infinite reverse'
                }}
              ></div>
              <div 
                className="absolute inset-0 rounded-full opacity-30"
                style={{
                  background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%)',
                  animation: 'liquidFlow 3s ease-in-out infinite 1s'
                }}
              ></div>
            </div>
            
            {/* Reflective highlights - multiple spots */}
            <div 
              className="absolute top-16 left-16 w-20 h-20 bg-white/60 rounded-full blur-md"
              style={{ animation: 'highlightPulse 2s ease-in-out infinite' }}
            ></div>
            <div 
              className="absolute bottom-20 right-20 w-16 h-16 bg-white/50 rounded-full blur-sm"
              style={{ animation: 'highlightPulse 2.5s ease-in-out infinite 0.5s' }}
            ></div>
            <div 
              className="absolute top-1/2 right-8 w-12 h-12 bg-white/40 rounded-full blur-sm"
              style={{ animation: 'highlightPulse 3s ease-in-out infinite 1s' }}
            ></div>
            
            {/* Metallic particles - more dynamic */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-white/70 rounded-full"
                  style={{
                    left: `${15 + i * 7}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    animation: `particleFloat ${2 + i * 0.2}s ease-in-out infinite ${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
            
            {/* AAVE Text in the center */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <h1 className="text-6xl font-bold text-black drop-shadow-lg">
                AAVE
              </h1>
            </div>
          </div>
          
          {/* Floating metallic orbs around main orb */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-8 h-8 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(200,200,200,0.3) 50%, transparent 100%)`,
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                  animation: `orbFloat ${4 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-white text-lg animate-pulse">
          Loading metallic effect...
        </div>
      )}
      
      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes metallicShine {
          0% { transform: translateX(-120%) rotate(45deg) scale(1); }
          25% { transform: translateX(-60%) rotate(45deg) scale(1.1); }
          50% { transform: translateX(0%) rotate(45deg) scale(1.2); }
          75% { transform: translateX(60%) rotate(45deg) scale(1.1); }
          100% { transform: translateX(120%) rotate(45deg) scale(1); }
        }
        
        @keyframes liquidFlow {
          0% { transform: translateX(-60%) scale(1) rotate(0deg); opacity: 0.2; }
          25% { transform: translateX(-30%) scale(1.1) rotate(5deg); opacity: 0.6; }
          50% { transform: translateX(0%) scale(1.2) rotate(0deg); opacity: 0.8; }
          75% { transform: translateX(30%) scale(1.1) rotate(-5deg); opacity: 0.6; }
          100% { transform: translateX(60%) scale(1) rotate(0deg); opacity: 0.2; }
        }
        
        @keyframes highlightPulse {
          0% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 0.9; transform: scale(1.3) rotate(180deg); }
          100% { opacity: 0.3; transform: scale(0.8) rotate(360deg); }
        }
        
        @keyframes particleFloat {
          0% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.4; }
          25% { transform: translateY(-15px) scale(1.2) rotate(90deg); opacity: 0.8; }
          50% { transform: translateY(-25px) scale(1.4) rotate(180deg); opacity: 1; }
          75% { transform: translateY(-15px) scale(1.2) rotate(270deg); opacity: 0.8; }
          100% { transform: translateY(0px) scale(1) rotate(360deg); opacity: 0.4; }
        }
        
        @keyframes ringPulse {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        
        @keyframes glowRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes orbFloat {
          0% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px) scale(1.1); opacity: 0.6; }
          50% { transform: translateY(-30px) translateX(0px) scale(1.2); opacity: 0.8; }
          75% { transform: translateY(-20px) translateX(-10px) scale(1.1); opacity: 0.6; }
          100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default CreativeMetallicEffect;
