import React from 'react';

export default function Spinner() {
    // Define the tech green color
    const techGreen = '#00e600'; // A vibrant green color

    return (
      // Full-screen overlay for loading transition
      <div className="fixed inset-0 bg-[#d0c7c9c9] bg-opacity-80 z-50 flex items-center justify-center">
        {/* Main container to hold the squares and triangle horizontally */}
        <div className="flex items-center justify-center">
          {/* First group of 4 squares */}
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="square animate-bounce"
                style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: techGreen, // Changed to tech green
                  borderRadius: '4px',
                  animation: `spin-bounce-${i} 1.2s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          {/* The central triangle element with horizontal margin */}
          {/* border-bottom color changed to tech green */}
          <div className="triangle-center mx-4" style={{ borderBottomColor: techGreen }}></div>

          {/* Second group of 4 squares */}
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i + 4} /* Offset key and animation index for the second set of squares */
                className="square animate-bounce"
                style={{
                  width: '30px',
                  height: '30px',
                  backgroundColor: techGreen, // Changed to tech green
                  borderRadius: '4px',
                  animation: `spin-bounce-${i + 4} 1.2s ease-in-out infinite`,
                  animationDelay: `${(i + 4) * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Styled JSX for animations and triangle shape */}
        <style>{`
          /* Keyframes for the squares (no color change needed here, it's in inline style) */
          @keyframes spin-bounce-0 {
            0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
            25% { transform: translateY(-44px) rotate(90deg) scale(0.8); }
            50% { transform: translateY(0) rotate(180deg) scale(0.6); }
            75% { transform: translateY(44px) rotate(270deg) scale(0.8); }
          }
          @keyframes spin-bounce-1 {
            0%, 100% { transform: translateY(0) rotate(-22.5deg) scale(1); }
            25% { transform: translateY(-44px) rotate(67.5deg) scale(0.8); }
            50% { transform: translateY(0) rotate(157.5deg) scale(0.6); }
            75% { transform: translateY(44px) rotate(247.5deg) scale(0.8); }
          }
          @keyframes spin-bounce-2 {
            0%, 100% { transform: translateY(0) rotate(-45deg) scale(1); }
            25% { transform: translateY(-44px) rotate(45deg) scale(0.8); }
            50% { transform: translateY(0) rotate(135deg) scale(0.6); }
            75% { transform: translateY(44px) rotate(225deg) scale(0.8); }
          }
          @keyframes spin-bounce-3 {
            0%, 100% { transform: translateY(0) rotate(-67.5deg) scale(1); }
            25% { transform: translateY(-44px) rotate(22.5deg) scale(0.8); }
            50% { transform: translateY(0) rotate(112.5deg) scale(0.6); }
            75% { transform: translateY(44px) rotate(202.5deg) scale(0.8); }
          }
          @keyframes spin-bounce-4 {
            0%, 100% { transform: translateY(0) rotate(-90deg) scale(1); }
            25% { transform: translateY(-44px) rotate(0deg) scale(0.8); }
            50% { transform: translateY(0) rotate(90deg) scale(0.6); }
            75% { transform: translateY(44px) rotate(180deg) scale(0.8); }
          }
          @keyframes spin-bounce-5 {
            0%, 100% { transform: translateY(0) rotate(-112.5deg) scale(1); }
            25% { transform: translateY(-44px) rotate(-22.5deg) scale(0.8); }
            50% { transform: translateY(0) rotate(67.5deg) scale(0.6); }
            75% { transform: translateY(157.5deg) rotate(157.5deg) scale(0.8); }
          }
          @keyframes spin-bounce-6 {
            0%, 100% { transform: translateY(0) rotate(-135deg) scale(1); }
            25% { transform: translateY(-44px) rotate(-45deg) scale(0.8); }
            50% { transform: translateY(0) rotate(45deg) scale(0.6); }
            75% { transform: translateY(44px) rotate(135deg) scale(0.8); }
          }
          @keyframes spin-bounce-7 {
            0%, 100% { transform: translateY(0) rotate(-157.5deg) scale(1); }
            25% { transform: translateY(-44px) rotate(-67.5deg) scale(0.8); }
            50% { transform: translateY(0) rotate(22.5deg) scale(0.6); }
            75% { transform: translateY(44px) rotate(112.5deg) scale(0.8); }
          }

          /* Styling for the central triangle */
          .triangle-center {
            width: 0;
            height: 0;
            border-left: 20px solid transparent;
            border-right: 20px solid transparent;
            /* border-bottom color is now set via inline style for dynamic color */
            border-bottom: 35px solid; /* Keep the border size, color will be overridden */
            animation: triangle-spin 2s linear infinite;
          }

          /* Keyframes for the triangle's spinning animation */
          @keyframes triangle-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }